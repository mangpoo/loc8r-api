import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mostRecentFirst'
})
export class MostRecentFirstPipe implements PipeTransform {

  // 비교 함수: a가 b보다 최신이면 -1 (앞으로), 아니면 1 (뒤로)
  private compare(a: any, b: any) {
    const createdOnA = a.createdOn;
    const createdOnB = b.createdOn;

    let comparison = 1;
    if (createdOnA > createdOnB) {
      comparison = -1;
    }
    return comparison;
  }

  transform(reviews: any[]): any[] {
    if (reviews && reviews.length > 0) {
      // 원본 배열을 변경하지 않기 위해 복사하거나 바로 sort
      return reviews.sort(this.compare);
    }
    return [];
  }

}