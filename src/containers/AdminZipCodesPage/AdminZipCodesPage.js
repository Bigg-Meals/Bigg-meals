import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import {
  H3,
  Page,
  LayoutSingleColumn,
  IconSpinner,
  PrimaryButtonInline,
  SecondaryButtonInline,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import { addZipCode, removeZipCode } from './AdminZipCodesPage.duck';
import css from './AdminZipCodesPage.module.css';

const ZIP_CODE_REGEX = /^\d{5}$/;

/**
 * AdminZipCodesPage – manage the list of allowed zip codes stored in the admin user's private data.
 *
 * @component
 * @param {Object} props
 * @param {string[]} props.zipCodes - Current zip codes from Redux store
 * @param {boolean} props.fetchInProgress - Whether initial fetch is in progress
 * @param {Object} props.fetchError - Error from initial fetch, if any
 * @param {boolean} props.addInProgress - Whether an add operation is in progress
 * @param {Object} props.addError - Error from last add operation, if any
 * @param {string|null} props.removingZipCode - The zip code currently being removed, or null
 * @param {Object} props.removeError - Error from last remove operation, if any
 * @param {function} props.onAddZipCode - Dispatch function to add a zip code
 * @param {function} props.onRemoveZipCode - Dispatch function to remove a zip code
 * @param {boolean} props.scrollingDisabled - Whether scrolling is disabled
 */
const AdminZipCodesPage = () => {
  const dispatch = useDispatch();
  const { zipCodes, fetchInProgress, fetchError, addInProgress, addError, removingZipCode, removeError } =
    useSelector(state => state.AdminZipCodesPage);
  const scrollingDisabled = useSelector(isScrollingDisabled);

  const onAddZipCode = zipCode => dispatch(addZipCode(zipCode));
  const onRemoveZipCode = zipCode => dispatch(removeZipCode(zipCode));

  const intl = useIntl();

  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState(null);

  const isOperationInProgress = addInProgress || !!removingZipCode;
  const isValidInput =
    ZIP_CODE_REGEX.test(inputValue.trim()) && !zipCodes.includes(inputValue.trim());

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!ZIP_CODE_REGEX.test(trimmed)) {
      setInputError(intl.formatMessage({ id: 'AdminZipCodesPage.invalidZipCode' }));
      return;
    }
    if (zipCodes.includes(trimmed)) {
      setInputError(intl.formatMessage({ id: 'AdminZipCodesPage.duplicateZipCode' }));
      return;
    }
    setInputValue('');
    setInputError(null);
    onAddZipCode(trimmed).catch(() => {});
  };

  const handleRemove = zip => {
    onRemoveZipCode(zip).catch(() => {});
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isValidInput && !isOperationInProgress) handleAdd();
    }
  };

  return (
    <Page
      title={intl.formatMessage({ id: 'AdminZipCodesPage.title' })}
      scrollingDisabled={scrollingDisabled}
    >
      <LayoutSingleColumn topbar={<TopbarContainer />} footer={<FooterContainer />}>
        <div className={css.root}>
          {fetchInProgress ? (
            <div className={css.spinnerWrapper}>
              <IconSpinner />
            </div>
          ) : fetchError?.status === 403 ? (
            <p className={css.errorMessage}>
              <FormattedMessage id="AdminZipCodesPage.noAccess" />
            </p>
          ) : (
            <>
              <H3 className={css.heading}>
                <FormattedMessage id="AdminZipCodesPage.heading" />
              </H3>

              {addError || removeError ? (
                <p className={css.errorMessage}>
                  <FormattedMessage id="AdminZipCodesPage.saveError" />
                </p>
              ) : null}

              <div className={css.controls}>
                <input
                  className={css.addInput}
                  type="text"
                  maxLength={5}
                  value={inputValue}
                  onChange={e => {
                    setInputValue(e.target.value);
                    setInputError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={intl.formatMessage({ id: 'AdminZipCodesPage.inputPlaceholder' })}
                  aria-label={intl.formatMessage({ id: 'AdminZipCodesPage.inputAriaLabel' })}
                  disabled={isOperationInProgress}
                />
                <PrimaryButtonInline
                  type="button"
                  className={css.addButton}
                  onClick={handleAdd}
                  disabled={!isValidInput || isOperationInProgress}
                >
                  {addInProgress ? (
                    <IconSpinner />
                  ) : (
                    <FormattedMessage id="AdminZipCodesPage.addButton" />
                  )}
                </PrimaryButtonInline>
              </div>

              {inputError ? <p className={css.inputError}>{inputError}</p> : null}

              {zipCodes.length === 0 ? (
                <p className={css.emptyState}>
                  <FormattedMessage id="AdminZipCodesPage.emptyState" />
                </p>
              ) : (
                <div className={css.tableWrapper}>
                  <table className={css.table}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>
                          <FormattedMessage id="AdminZipCodesPage.tableColZipCode" />
                        </th>
                        <th>
                          <FormattedMessage id="AdminZipCodesPage.tableColActions" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {zipCodes.map((zip, index) => (
                        <tr key={zip}>
                          <td>{index + 1}</td>
                          <td>{zip}</td>
                          <td>
                            <div className={css.actionCell}>
                              {removingZipCode === zip ? (
                                <IconSpinner />
                              ) : (
                                <SecondaryButtonInline
                                  type="button"
                                  className={css.removeButton}
                                  onClick={() => handleRemove(zip)}
                                  disabled={isOperationInProgress}
                                >
                                  <FormattedMessage id="AdminZipCodesPage.removeButton" />
                                </SecondaryButtonInline>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

export default AdminZipCodesPage;
