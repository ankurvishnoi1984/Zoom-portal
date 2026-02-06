// const winston = require('winston');

// // Define log levels and corresponding colors
// const logLevels = {
//   error: 'red',
//   warn: 'yellow',
//   info: 'green',
//   debug: 'blue',
// };

// // Configure Winston logger
// const logger = winston.createLogger({
//   levels: "info",
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.timestamp(),
//     winston.format.printf(({ timestamp, level, message }) => {
//       return `[${timestamp}] ${level}: ${message}`;
//     })
//   ),
//   transports: [
//     new winston.transports.Console(),
//     // Add other transports as needed (e.g., file transport)
//   ],
// });

// module.exports = logger;


const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ],
});

module.exports = logger;
