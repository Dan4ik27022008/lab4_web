import { Command } from 'commander';
import http from 'http';
import fs from 'fs';

const program = new Command();

program
  .helpOption('-e, --help', 'вивести довідку')
  .requiredOption('-i, --input <path>', 'шлях до файлу даних')
  .requiredOption('-h, --host <address>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера')
  .option('-o, --output <path>', 'файл для запису результату');

program.parse();
const options = program.opts();

// Перевірка існування файлу перед запуском сервера
fs.access(options.input, fs.constants.F_OK, (err) => {
  if (err) {
    console.error('Cannot find input file');
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    // Асинхронне читання файлу
    fs.readFile(options.input, 'utf-8', (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Помилка сервера: Не вдалося прочитати файл даних (500)');
      }

      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (parseErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Помилка сервера: Файл даних пошкоджено, це не валідний JSON (500)');
      }

      // Тимчасово для перевірки
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: "Файл успішно прочитано", count: jsonData.length }));
    });
  });

  server.listen(options.port, options.host, () => {
    console.log(`Сервер працює за адресою http://${options.host}:${options.port}`);
  });
});