import { DataSource, DataSourceOptions } from 'typeorm';

function buildDataSourceOptions(): DataSourceOptions {
  const base = {
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
  };

  // Neon (and other hosted Postgres) provides a full connection URL with SSL.
  // When DATABASE_URL is set we use it directly; otherwise fall back to the
  // individual DB_* vars used in local/Docker development.
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      ...base,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT as string) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'twitter_clone',
    ...base,
  };
}

export const AppDataSource = new DataSource(buildDataSourceOptions());
