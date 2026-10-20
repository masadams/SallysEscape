// Record Blossom Hollow: node scripts/record-spring.cjs [--write] (same as record-season.cjs spring).
require('./record-season.cjs').recorder('spring').main(process.argv.slice(2));
