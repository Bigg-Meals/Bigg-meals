import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'react-final-form';
import { useIntl } from '../../../../../util/reactIntl';
import classNames from 'classnames';

import { LocationAutocompleteInput, IconLocation } from '../../../../../components';
import css from './FilterLocation.module.css';

const identity = v => v;

const CustomIconLocation = () => {
  return <IconLocation rootClassName={css.customIconLocation} />;
};

const LocationSearchField = props => {
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const { inputRootClass, intl, inputRef, onLocationChange, alignLeft } = props;
  const allowedZipCodes = useSelector(state => state.AdminZipCodesPage.zipCodes);

  return (
    <Field
      name="location"
      format={identity}
      render={({ input, meta }) => {
        const { onChange, ...restInput } = input;
        const searchOnChange = value => {
          const filteredValue = value?.predictions
            ? {
                ...value,
                predictions: value.predictions.filter(
                  p =>
                    Array.isArray(p.place_type) &&
                    p.place_type.includes('postcode') &&
                    allowedZipCodes.includes(p.text)
                ),
              }
            : value;
          onChange(filteredValue);
          onLocationChange(filteredValue);
          if (value?.selectedPlace && value.selectedPlace.address == '') {
            setIsCurrentLocation(true);
          } else {
            setIsCurrentLocation(false);
          }
        };

        return (
          <LocationAutocompleteInput
            id="location-search-filter-location"
            className={css.customField}
            useDarkText={true}
            inputClassName={isCurrentLocation ? css.inputWithCurrentLocation : inputRootClass}
            closeOnBlur={true}
            predictionsClassName={classNames(css.predictions, {
              [css.alignLeft]: alignLeft,
            })}
            CustomIcon={CustomIconLocation}
            iconClassName={css.locationAutocompleteInputIconWrapper}
            isCurrentLocation={isCurrentLocation}
            placeholder={
              isCurrentLocation
                ? intl.formatMessage({ id: 'PageBuilder.SearchCTA.currentLocationPlaceholder' })
                : intl.formatMessage({ id: 'PageBuilder.SearchCTA.locationPlaceholder' })
            }
            inputRef={inputRef}
            input={{ ...restInput, onChange: searchOnChange }}
            meta={meta}
          />
        );
      }}
    />
  );
};

const FilterLocation = props => {
  const searchInpuRef = useRef(null);
  const intl = useIntl();
  const {
    appConfig,
    onSubmit,
    setSubmitDisabled,
    className,
    rootClassName,
    alignLeft,
    isCurrentLocation,
    ...restOfProps
  } = props;
  const classes = classNames(rootClassName || css.root, className);

  const onChange = location => {
    if (location?.search?.length > 0 && !location?.selectedPlace) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  };

  return (
    <div className={classes}>
      <LocationSearchField
        inputRootClass={css.input}
        intl={intl}
        inputRef={searchInpuRef}
        onLocationChange={onChange}
        alignLeft={alignLeft}
      />
    </div>
  );
};
export default FilterLocation;
