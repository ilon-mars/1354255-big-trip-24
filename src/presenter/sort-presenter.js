import { remove, render, replace } from '@/framework/render';

import SortView from '@/view/sort-view';

import { Sort } from '@/utils';

class SortPresenter {
  #sortTypes = [];

  #container = null;
  #sortComponent = null;

  #sortTypesChangeHandler = null;

  constructor({ container, currentSort, onSortTypeChange }) {
    this.#sortTypes = Object.values(Sort).map((sortType) => ({
      type: sortType,
      isChecked: sortType === currentSort
    }));
    this.#sortTypesChangeHandler = onSortTypeChange;
    this.#container = container;
  }

  init() {
    const prevSortComponent = this.#sortComponent;

    this.#sortComponent = new SortView({
      items: this.#sortTypes,
      onItemChange: this.#sortTypesChangeHandler,
    });

    if (prevSortComponent) {
      replace(this.#sortComponent, prevSortComponent);
      remove(prevSortComponent);
    } else {
      render(this.#sortComponent, this.#container);
    }
  }

  destroy() {
    remove(this.#sortComponent);
  }
}

export default SortPresenter;
