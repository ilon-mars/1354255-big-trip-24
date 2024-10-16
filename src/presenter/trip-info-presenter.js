import { remove, render, RenderPosition, replace } from '@/framework/render';

import TripInfoView from '@/view/trip-info-view';

import {
  DateTimeFormat,
  DESTINATIONS_TO_SHOW,
  ELLIPSES_SYMBOL,
  sortPointsByType,
  Sort,
  sortByLastDate,
  formatDate,
  getOffersCost,
  SEPARATOR_SYMBOL
} from '@/utils';

class TripInfoPresenter {
  #routeModel = null;
  #destinationsModel = null;
  #offersModel = null;

  #tripInfoComponent = null;

  constructor({ routeModel, destinationsModel, offersModel }) {
    this.#routeModel = routeModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;

    this.#routeModel.addObserver(this.#handleModelEvent);
  }

  get #points() {
    return sortPointsByType(this.#routeModel.points, Sort.DAY);
  }

  get #startPoint() {
    return this.#points.at(0);
  }

  get #endPoint() {
    return this.#points.toSorted(sortByLastDate).at(0);
  }

  get #route() {
    const destinationNames = this.#points
      .map((point) => this.#destinationsModel.getDestinationById(point.destination)?.name)
      .filter(Boolean);

    const route = destinationNames.length > DESTINATIONS_TO_SHOW
      ? [
        this.#destinationsModel.getDestinationById(this.#startPoint.destination)?.name,
        ELLIPSES_SYMBOL,
        this.#destinationsModel.getDestinationById(this.#endPoint.destination)?.name,
      ]
      : destinationNames;

    return route.join(SEPARATOR_SYMBOL);
  }

  get #duration() {
    const startDate = formatDate(this.#startPoint.dateFrom, DateTimeFormat.TRIP);
    const endDate = formatDate(this.#endPoint.dateTo, DateTimeFormat.TRIP);

    return `${startDate}${SEPARATOR_SYMBOL}${endDate}`;
  }

  get #cost() {
    return this.#points.reduce((acc, point) => {
      acc += (+point.basePrice + getOffersCost(this.#offersModel.getCheckedOffers(point)));
      return acc;
    }, 0);
  }

  init() {
    if (!this.#points.length) {
      return;
    }

    const container = document.querySelector('.trip-main');
    const prevTripInfoComponent = this.#tripInfoComponent;

    this.#tripInfoComponent = new TripInfoView({
      route: this.#route,
      duration: this.#duration,
      cost: this.#cost
    });

    if (prevTripInfoComponent) {
      replace(this.#tripInfoComponent, prevTripInfoComponent);
      remove(prevTripInfoComponent);
    } else {
      render(this.#tripInfoComponent, container, RenderPosition.AFTERBEGIN);
    }
  }

  destroy() {
    remove(this.#tripInfoComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };
}

export default TripInfoPresenter;
