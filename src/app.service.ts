import { Injectable,Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createReadStream } from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { ProductService } from './product/product.service';
import { ProductCsvDto } from './product/dtos/productCsv.dto';
import { join } from 'path';
import { OpenAiService } from './open-ai/open-ai.service';
const csv = require('csv-parser');

@Injectable()
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    private productService: ProductService,
    private openAIService: OpenAiService,
  ) {}

  @Cron('0 0 * * *')
  handleCron() {
    const results: ProductCsvDto[] = [];
    // Call provider endpoint
    console.log('test')
    createReadStream(join(process.cwd()) + '/src/dump-data/images40.txt')
      .pipe(csv({ separator: '\t' }))
      .on('data', (data: ProductCsvDto) => {
        results.push(data);
      })
      .on('end', async () => {
        console.log('attempting to saved ' + results.length + ' records');
        try {
          let count = 1;
          for (const data of results) {
            await this.productService.create(data);
            console.log('saved ' + data.ProductID);
            if (count < 11) {
              const { description, success } =
                await this.openAIService.getNewAIDescription({
                  productDescription: data.ProductDescription,
                  productName: data.ProductName,
                  category: data.CategoryName,
                });
              if (success) {
                this.productService.updateProductDescription({
                  productId: data.ProductID,
                  description,
                });
              }
            }
            count++;
          }
        } catch (err) {
          console.log('An error ocurred');
          console.error(err);
        }
      });
  }
  getHello(): string {
    return 'Hello World!';
  }
}
