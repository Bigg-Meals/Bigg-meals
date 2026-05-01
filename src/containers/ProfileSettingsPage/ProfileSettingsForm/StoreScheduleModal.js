import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { Modal, Button, H3, Heading } from '../../../components';
import AvailabilityPlanEntries from '../../EditListingPage/EditListingWizard/EditListingAvailabilityPanel/EditListingAvailabilityPlanForm/AvailabilityPlanEntries';

import css from './StoreScheduleModal.module.css';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// Convert storeTimings (flat object) → FinalForm initial values
// AvailabilityPlanEntries stores per-day arrays: { activePlanDays: ['mon'], mon: [{ startTime, endTime, seats }] }
const storeTimingsToFormValues = storeTimings => {
  const timings = storeTimings || {};
  const activePlanDays = Object.keys(timings);
  const dayValues = activePlanDays.reduce((acc, day) => {
    const { startTime, endTime } = timings[day];
    acc[day] = [{ startTime, endTime, seats: 1 }];
    return acc;
  }, {});
  return { activePlanDays, ...dayValues };
};

// Convert form values back to flat storeTimings object (first slot per day only)
const formValuesToStoreTimings = values => {
  const { activePlanDays = [], ...rest } = values;
  const storeTimings = (activePlanDays || []).reduce((acc, day) => {
    const entries = rest[day];
    if (entries && entries[0]?.startTime && entries[0]?.endTime) {
      acc[day] = { startTime: entries[0].startTime, endTime: entries[0].endTime };
    }
    return acc;
  }, {});
  return { storeTimings };
};

/**
 * StoreScheduleModal — modal form for editing store operating hours.
 *
 * @component
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onManageDisableScrolling - Required by Modal
 * @param {Function} props.onSave - Called with { storeTimeZone, storeTimings } on submit
 * @param {Object} props.initialValues - Initial form values
 * @returns {JSX.Element}
 */
const StoreScheduleModal = props => {
  const { isOpen, onClose, onManageDisableScrolling, onSave, storeTimings } = props;
  const intl = useIntl();

  return (
    <Modal
      id="StoreScheduleModal"
      isOpen={isOpen}
      onClose={onClose}
      onManageDisableScrolling={onManageDisableScrolling}
    >
      <FinalForm
        initialValues={storeTimingsToFormValues(storeTimings)}
        onSubmit={values => {
          onSave(formValuesToStoreTimings(values));
          onClose();
        }}
        mutators={{ ...arrayMutators }}
        render={({ handleSubmit, values, form: formApi }) => {
          const activePlanDays = values.activePlanDays || [];
          const hasUnfinishedEntries = WEEKDAYS.filter(d => activePlanDays.includes(d)).some(d => {
            const entries = values[d] || [];
            return entries.some(e => !e.startTime || !e.endTime);
          });

          return (
            <form onSubmit={handleSubmit} className={css.form}>
              <H3 as="h2" className={css.title}>
                <FormattedMessage id="ProfileSettingsForm.scheduleModalTitle" />
              </H3>

              {/* Weekday rows — reuse AvailabilityPlanEntries */}
              <Heading as="h3" rootClassName={css.subheading}>
                <FormattedMessage id="ProfileSettingsForm.scheduleHoursTitle" />
              </Heading>
              <div className={css.week}>
                {WEEKDAYS.map(day => (
                  <AvailabilityPlanEntries
                    key={day}
                    dayOfWeek={day}
                    useFullDays={false}
                    useMultipleSeats={false}
                    unitType="hour"
                    allowMultipleSlots={false}
                    values={values}
                    formApi={formApi}
                    intl={intl}
                  />
                ))}
              </div>

              <Button type="submit" className={css.saveButton} disabled={hasUnfinishedEntries}>
                <FormattedMessage id="ProfileSettingsForm.scheduleSave" />
              </Button>
            </form>
          );
        }}
      />
    </Modal>
  );
};

export default StoreScheduleModal;
