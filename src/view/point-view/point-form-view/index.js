import flatpickr from 'flatpickr';

import AbstractStatefulView from '@/framework/view/abstract-stateful-view';

import {
  isValidPrice,
  pointMode,
  PointType
} from '@/utils';
import { createTemplate } from './create-template';

import 'flatpickr/dist/flatpickr.min.css';

const DEFAULT_POINT = {
  basePrice: 0,
  dateFrom: null,
  dateTo: null,
  destination: null,
  isFavorite: false,
  offers: [],
  type: PointType.FLIGHT
};

class PointFormView extends AbstractStatefulView {
  #mode = pointMode.EDIT;
  #datepickerStart = null;
  #datepickerEnd = null;

  #offersModel = null;
  #destinationsModel = null;

  #handleFormSubmit = null;
  #handleCloseClick = null;
  #handleResetClick = null;

  constructor({
    point = DEFAULT_POINT,
    mode = pointMode.EDIT,
    offersModel,
    destinationsModel,
    onFormSubmit,
    onCloseClick,
    onResetClick
  }) {
    super();
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;

    this._setState(this.#parsePointToState(point));

    this.#handleFormSubmit = onFormSubmit;
    this.#handleCloseClick = onCloseClick;
    this.#handleResetClick = onResetClick;
    this.#mode = mode;

    this.#setEventListeners();
    this.#setDatePickers();
  }

  get template() {
    return createTemplate(this._state, this.#destinationsModel.availableDestinations, this.#mode);
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }

    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  }

  reset(point) {
    this.updateElement(
      this.#parsePointToState(point),
    );
  }

  _restoreHandlers() {
    this.#setEventListeners();
    this.#setDatePickers();
  }

  #setEventListeners() {
    this.element.addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#pointTypeSelectHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#pointDestinationSelectHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#resetClickHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceInputHandler);
    this.element.querySelector('.event__available-offers')?.addEventListener('click', this.#offersListHandler);

    if (this.#mode === pointMode.EDIT) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeClickHandler);
    }
  }

  #setDatePickers() {
    const config = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      'time_24hr': true,
    };

    this.#setDatePickerStart(config);
    this.#setDatePickerEnd(config);
  }

  #setDatePickerStart(config) {
    this.#datepickerStart = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        ...config,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
      }
    );
  }

  #setDatePickerEnd(config) {
    this.#datepickerEnd = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        ...config,
        defaultDate: this._state.dateTo,
        onChange: this.#dateToChangeHandler,
        minDate: this._state.dateFrom
      }
    );
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(this.#parseStateToPoint(this._state));
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick(this.#parseStateToPoint(this._state));
  };

  #resetClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleResetClick(this.#parseStateToPoint(this._state));
  };

  #pointTypeSelectHandler = (evt) => {
    evt.preventDefault();

    const type = evt.target.value;
    const offers = this.#offersModel.getOffersByPointType(type).map((offer) => ({
      ...offer,
      isChecked: false
    }));

    this.updateElement({
      ...this._state,
      selectedType: type,
      type,
      offers,
    });
  };

  #pointDestinationSelectHandler = (evt) => {
    evt.preventDefault();

    if (!this.#destinationsModel.isValidName(evt.target.value)) {
      return;
    }

    const name = evt.target.value;
    const destination = this.#destinationsModel.getDestinationByName(name);

    this.updateElement({
      ...this._state,
      name,
      destination,
    });
  };

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      dateFrom: userDate
    });
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate
    });
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();

    if (!isValidPrice(evt.target.value)) {
      evt.target.value = this._state.basePrice;
      return;
    }

    const basePrice = evt.target.value;

    this.updateElement({
      ...this._state,
      basePrice,
    });
  };

  #offersListHandler = (evt) => {
    evt.preventDefault();

    if (!evt.target.closest('.event__offer-selector')) {
      return;
    }

    const inputElement = evt.target.closest('.event__offer-selector').firstElementChild;

    const offers = this._state.offers.map((offer) => {
      if (offer.id === inputElement.id) {
        return { ...offer, isChecked: !offer.isChecked };
      }

      return offer;
    });

    this.updateElement({
      ...this._state,
      offers,
    });
  };

  #parsePointToState(point) {
    return {
      ...point,
      destination: this.#destinationsModel.getDestinationById(point.destination),
      offers: this.#offersModel.getCheckedOffers(point),
      selectedType: point.type,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  #parseStateToPoint(state) {
    const point = {
      ...state,
      destination: state.destination?.id,
      offers: state.offers.filter((offer) => offer.isChecked).map((offer) => offer.id)
    };

    delete point.selectedType;
    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;

    return point;
  }

}

export default PointFormView;
