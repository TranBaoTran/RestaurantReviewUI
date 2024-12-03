import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {

  transform(value: number): string {
    if (!value && value !== 0) return '';

    const formattedValue = value.toLocaleString('en-US'); 

    return `${formattedValue} VNĐ`;
  }

}
