import winston = require('winston');

const transports = (process.env.NODE_ENV === 'production') ? [
    new winston.transports.Console({ level: 'info' }),
] : [
    new winston.transports.Console({ level: 'debug' }),
];

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports,
});

logger.info('Keez Wrapper initialized');
