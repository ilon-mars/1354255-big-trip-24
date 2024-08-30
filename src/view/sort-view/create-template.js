import { capitalizeFirstLetter } from '@/utils';

const Sort = Object.freeze({
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFER: 'offer'
});

const SORT_DISABLED = [Sort.EVENT, Sort.OFFER];

const createTemplate = () => {
  const template = Object.values(Sort).map((sort) => {
    const isChecked = sort === Sort.DAY ? 'checked' : '';
    const isDisabled = SORT_DISABLED.includes(sort) ? 'disabled' : '';

    return (
      `<div class="trip-sort__item  trip-sort__item--${sort}">
        <input
          id="sort-${sort}"
          class="trip-sort__input  visually-hidden"
          type="radio" name="trip-sort"
          value="sort-${sort}"
          ${isChecked}
          ${isDisabled}>
        <label class="trip-sort__btn" for="sort-${sort}">${capitalizeFirstLetter(sort)}</label>
      </div>`
    );
  }).join('');

  return (
    `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
      ${template}
    </form>`
  );
};

export { createTemplate };