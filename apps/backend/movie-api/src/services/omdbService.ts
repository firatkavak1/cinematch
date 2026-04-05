import axios, { AxiosInstance } from 'axios';
import { logger } from 'server-utils';
import type { MovieRatings } from 'shared';

import { config } from '../env';

interface OmdbResponse {
  Response: string;
  Title?: string;
  imdbRating?: string;
  imdbVotes?: string;
  Metascore?: string;
  Ratings?: Array<{ Source: string; Value: string }>;
  Error?: string;
}

class OmdbService {
  private client: AxiosInstance;
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = config.OMDB_API_KEY !== '' && config.OMDB_API_KEY !== 'YOUR_OMDB_API_KEY';
    this.client = axios.create({
      baseURL: config.OMDB_BASE_URL,
      timeout: 10000,
    });
  }

  async getExternalRatings(imdbId: string): Promise<{
    imdb: { score: string | null; votes: string | null };
    rottenTomatoes: { score: string | null };
    metascore: string | null;
  }> {
    if (!this.isAvailable || !imdbId) {
      return this.emptyRatings();
    }

    try {
      const { data } = await this.client.get<OmdbResponse>('/', {
        params: {
          i: imdbId,
          apikey: config.OMDB_API_KEY,
        },
      });

      if (data.Response === 'False') {
        logger.warn(`OMDB returned no data for ${imdbId}: ${data.Error}`);
        return this.emptyRatings();
      }

      const rtRating = data.Ratings?.find((r) => r.Source === 'Rotten Tomatoes');

      return {
        imdb: {
          score: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null,
          votes: data.imdbVotes && data.imdbVotes !== 'N/A' ? data.imdbVotes : null,
        },
        rottenTomatoes: {
          score: rtRating?.Value ?? null,
        },
        metascore: data.Metascore && data.Metascore !== 'N/A' ? data.Metascore : null,
      };
    } catch (error) {
      logger.warn(`Failed to fetch OMDB ratings for ${imdbId}`, { error });
      return this.emptyRatings();
    }
  }

  private emptyRatings(): {
    imdb: { score: string | null; votes: string | null };
    rottenTomatoes: { score: string | null };
    metascore: string | null;
  } {
    return {
      imdb: { score: null, votes: null },
      rottenTomatoes: { score: null },
      metascore: null,
    };
  }
}

export const omdbService = new OmdbService();
