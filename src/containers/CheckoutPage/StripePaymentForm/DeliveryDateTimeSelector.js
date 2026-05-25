import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';
import { FieldSelect, FieldSingleDatePicker, Heading } from '../../../components';

import css from './StripePaymentForm.module.css';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const generateSlots = (startTime, endTime) => {
  const startH = parseInt(startTime.split(':')[0], 10);
  const endH = parseInt(endTime.split(':')[0], 10);
  const slots = [];
  for (let h = startH; h <= endH; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
};

const formatHour = (time24, intl) => {
  const h = parseInt(time24.split(':')[0], 10);
  const d = new Date(Date.UTC(2000, 0, 1, h, 0));
  return intl.formatTime(d, { hour: 'numeric', minute: 'numeric', timeZone: 'Etc/UTC' });
};

const isSameLocalDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Earliest bookable hour = next whole hour from now + preparation buffer
// e.g. now=11:00, prep=2 → 13  |  now=11:30, prep=2 → 14  |  now=11:00, prep=0 → 11
const getEarliestFromHour = preparationHours => {
  const now = new Date();
  const currentWholeHour = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 60);
  return currentWholeHour + (preparationHours || 0);
};

const DeliveryDateTimeSelector = props => {
  const { storeTimings, deliveryMethod, preparationHours, values, formApi, intl, formId } = props;

  if (!storeTimings || !deliveryMethod) return null;

  const isPickup = deliveryMethod === 'pickup';
  const openDays = Object.keys(storeTimings);
  const today = new Date();

  const isDayBlocked = day => {
    const key = WEEKDAY_KEYS[day.getDay()];
    if (!openDays.includes(key)) return true;

    // For today, block the day if the prep buffer leaves no usable slots
    if (isSameLocalDay(day, today)) {
      const timings = storeTimings[key];
      const allSlots = generateSlots(timings.startTime, timings.endTime);
      const cutoff = getEarliestFromHour(preparationHours);
      // fromSlots exclude last (can't start at closing time)
      const usableFromSlots = allSlots.slice(0, -1).filter(s => parseInt(s, 10) >= cutoff);
      return usableFromSlots.length === 0;
    }

    return false;
  };

  const selectedDate = values?.deliveryDate?.date;
  const selectedDayKey = selectedDate ? WEEKDAY_KEYS[selectedDate.getDay()] : null;
  const dayTimings = selectedDayKey ? storeTimings[selectedDayKey] : null;
  const allSlots = dayTimings ? generateSlots(dayTimings.startTime, dayTimings.endTime) : [];

  // For today: filter out hours before (current time + prep buffer)
  const isSelectedToday = selectedDate ? isSameLocalDay(selectedDate, today) : false;
  const cutoffHour = isSelectedToday ? getEarliestFromHour(preparationHours) : 0;
  const fromSlots = allSlots.slice(0, -1).filter(s => parseInt(s, 10) >= cutoffHour);

  const selectedFrom = values?.deliveryTimeFrom;
  const fromIndex = selectedFrom ? allSlots.indexOf(selectedFrom) : -1;
  const toSlots = fromIndex >= 0 ? allSlots.slice(fromIndex + 1) : allSlots.slice(1);

  const titleId = isPickup
    ? 'StripePaymentForm.pickupDateTimeTitle'
    : 'StripePaymentForm.deliveryDateTimeTitle';
  const dateLabelId = isPickup
    ? 'StripePaymentForm.pickupDateLabel'
    : 'StripePaymentForm.deliveryDateLabel';
  const fromLabelId = isPickup
    ? 'StripePaymentForm.pickupTimeFromLabel'
    : 'StripePaymentForm.deliveryTimeFromLabel';
  const toLabelId = isPickup
    ? 'StripePaymentForm.pickupTimeToLabel'
    : 'StripePaymentForm.deliveryTimeToLabel';

  const handleFromChange = newFrom => {
    const newFromIndex = allSlots.indexOf(newFrom);
    const currentTo = values?.deliveryTimeTo;
    const currentToIndex = currentTo ? allSlots.indexOf(currentTo) : -1;
    if (currentToIndex <= newFromIndex) {
      const autoTo = allSlots[newFromIndex + 1];
      formApi.change('deliveryTimeTo', autoTo || undefined);
    }
  };

  const handleDateChange = () => {
    formApi.change('deliveryTimeFrom', undefined);
    formApi.change('deliveryTimeTo', undefined);
  };

  return (
    <div className={css.deliveryDateTime}>
      <Heading as="h3" rootClassName={css.heading}>
        <FormattedMessage id={titleId} />
      </Heading>

      <FieldSingleDatePicker
        id={`${formId}.deliveryDate`}
        name="deliveryDate"
        label={intl.formatMessage({ id: dateLabelId })}
        placeholderText={intl.formatMessage({ id: 'StripePaymentForm.deliveryDatePlaceholder' })}
        popupClassName={css.datePickerPopup}
        isDayBlocked={isDayBlocked}
        showErrorMessage
        validate={validators.required(
          intl.formatMessage({ id: 'StripePaymentForm.deliveryDateRequired' })
        )}
        onChange={handleDateChange}
      />

      {selectedDate && dayTimings && fromSlots.length === 0 ? (
        <p className={css.noSlotsMessage}>
          <FormattedMessage id="StripePaymentForm.noSlotsAvailable" />
        </p>
      ) : null}

      {selectedDate && dayTimings && fromSlots.length > 0 ? (
        <div className={css.deliveryTimeRow}>
          <FieldSelect
            className={css.deliveryTimeField}
            id={`${formId}.deliveryTimeFrom`}
            name="deliveryTimeFrom"
            label={intl.formatMessage({ id: fromLabelId })}
            validate={validators.required(
              intl.formatMessage({ id: 'StripePaymentForm.deliveryTimeRequired' })
            )}
            onChange={handleFromChange}
          >
            <option disabled value="">
              --
            </option>
            {fromSlots.map(t => (
              <option key={t} value={t}>
                {formatHour(t, intl)}
              </option>
            ))}
          </FieldSelect>

          <span className={css.deliveryTimeSeparator}>–</span>

          <FieldSelect
            className={css.deliveryTimeField}
            id={`${formId}.deliveryTimeTo`}
            name="deliveryTimeTo"
            label={intl.formatMessage({ id: toLabelId })}
            validate={validators.required(
              intl.formatMessage({ id: 'StripePaymentForm.deliveryTimeRequired' })
            )}
          >
            <option disabled value="">
              --
            </option>
            {toSlots.map(t => (
              <option key={t} value={t}>
                {formatHour(t, intl)}
              </option>
            ))}
          </FieldSelect>
        </div>
      ) : null}
    </div>
  );
};

export default DeliveryDateTimeSelector;
