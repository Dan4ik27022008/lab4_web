import { Command } from 'commander';
import http from 'http';
import fs from 'fs';
import url from 'url';

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
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;

    // Перевірка маршруту
    if (parsedUrl.pathname !== '/') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Помилка: Маршрут не знайдено (404)');
    }

    // Перевірка параметра min_price
    let minPrice = null;
    if (query.min_price !== undefined) {
      minPrice = Number(query.min_price);
      if (isNaN(minPrice)) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Помилка: Параметр min_price має бути числом (400)');
      }
    }

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
        return res.end('Помилка сервера: Некоректний JSON (500)');
      }

      const showSymbol = query.symbol === 'true';

      // Фільтрація та перетворення даних
      let result = jsonData.filter(item => {
        const itemPrice = Number(item.price);
        if (minPrice !== null && (isNaN(itemPrice) || itemPrice <= minPrice)) {
          return false;
        }
        return true;
      }).map(item => {
        const mappedObj = {
          coin: item.coin_name || null,
        };
        
        if (showSymbol) {
          mappedObj.symbol = item.symbol || null;
        }
        
        mappedObj.date = item.date || null;
        mappedObj.price = Number(item.price) || null;

        return mappedObj;
      });

      const responseJson = JSON.stringify(result, null, 2);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(responseJson);
    });
  });

  server.listen(options.port, options.host, () => {
    console.log(`Сервер працює за адресою http://${options.host}:${options.port}`);
  });
});