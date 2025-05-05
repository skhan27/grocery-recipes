import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ingredientList',
    standalone: true,
})
export class IngredientListPipe implements PipeTransform {
    transform(items: { name: string }[] | undefined): string {
        if (!items || !Array.isArray(items)) return '';
        return items.map(i => i.name).join(', ');
    }
}