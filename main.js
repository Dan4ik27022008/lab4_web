import { Command } from 'commander';

const program = new Command();

program
  .helpOption('-e, --help', 'вивести довідку')
  .requiredOption('-i, --input <path>', 'шлях до файлу даних')
  .requiredOption('-h, --host <address>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера')
  .option('-o, --output <path>', 'файл для запису результату');

program.parse();
const options = program.opts();

console.log('Опції успішно зчитано:', options);