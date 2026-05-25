import React, { useState, useEffect, useRef } from 'react';
import { Heading, IconSpinner } from '../../../components';
import css from './TipForm.module.css';

const TIP_PERCENTAGES = [15, 20, 25];

const TipForm = ({
  payinTotal = 0,
  currency = 'USD',
  intl,
  formApi,
  onTipApplied,
  tipSpeculating,
}) => {
  const [selectedOption, setSelectedOption] = useState(15); // 15 | 20 | 25 | 'custom'
  const [customInput, setCustomInput] = useState('0.00');
  const defaultApplied = useRef(false);

  const formatMoney = amount => intl.formatNumber(amount, { style: 'currency', currency });

  const tipAmountForPercent = pct => payinTotal * (pct / 100);

  const isCustom = selectedOption === 'custom';

  const applyTip = amountInDollars => {
    const subunits = Math.round(amountInDollars * 100);
    if (formApi) {
      formApi.change('tip', subunits);
    }
    if (onTipApplied) {
      onTipApplied(subunits);
    }
  };

  const removeTip = () => {
    if (formApi) formApi.change('tip', 0);
    if (onTipApplied) onTipApplied(0);
  };

  useEffect(() => {
    if (!defaultApplied.current && payinTotal > 0) {
      defaultApplied.current = true;
      const amount = tipAmountForPercent(15);
      setCustomInput(amount.toFixed(2));
      applyTip(amount);
    }
  }, [payinTotal]);

  const handlePresetClick = pct => {
    if (selectedOption === pct) {
      setSelectedOption(null);
      setCustomInput('0.00');
      removeTip();
    } else {
      const amount = tipAmountForPercent(pct);
      setSelectedOption(pct);
      setCustomInput(amount.toFixed(2));
      applyTip(amount);
    }
  };

  const handleDecrement = () => {
    const current = parseFloat(customInput) || 0;
    setCustomInput(Math.max(0, current - 1).toFixed(2));
  };

  const handleIncrement = () => {
    const current = parseFloat(customInput) || 0;
    setCustomInput((current + 1).toFixed(2));
  };

  const handleUpdateTip = () => {
    applyTip(parseFloat(customInput) || 0);
  };

  return (
    <div className={css.root}>
      <Heading as="h3" rootClassName={css.heading}>
        Add tip
      </Heading>

      <div className={css.card}>
        <p className={css.supportText}>Show your support for the team at Bigg Meals</p>

        <div className={css.tipContent}>
          <div className={css.presetGrid}>
            {TIP_PERCENTAGES.map(pct => (
              <button
                key={pct}
                type="button"
                disabled={tipSpeculating}
                className={`${css.presetOption} ${
                  selectedOption === pct ? css.presetSelected : ''
                }`}
                onClick={() => handlePresetClick(pct)}
              >
                <span className={css.presetPercent}>{pct}%</span>
              </button>
            ))}
            <button
              type="button"
              disabled={tipSpeculating}
              className={`${css.presetOption} ${css.customOption} ${
                isCustom ? css.presetSelected : ''
              }`}
              onClick={() => {
                if (isCustom) {
                  setSelectedOption(null);
                  removeTip();
                } else {
                  setSelectedOption('custom');
                }
              }}
            >
              <span className={css.customLabel}>Custom</span>
            </button>
          </div>

          <div className={css.customInputRow}>
            <div className={`${css.customInputBox} ${!isCustom ? css.customInputDisabled : ''}`}>
              <span className={css.currencySymbol}>$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={css.customInput}
                value={customInput}
                disabled={!isCustom}
                onChange={e => setCustomInput(e.target.value)}
              />
              <button
                type="button"
                className={css.stepper}
                onClick={handleDecrement}
                disabled={!isCustom}
              >
                &minus;
              </button>
              <button
                type="button"
                className={css.stepper}
                onClick={handleIncrement}
                disabled={!isCustom}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={css.updateButton}
              disabled={!isCustom || tipSpeculating}
              onClick={handleUpdateTip}
            >
              {tipSpeculating ? <IconSpinner /> : 'Update tip'}
            </button>
          </div>

          {selectedOption !== null && <p className={css.thankYou}>Thank you, we appreciate it.</p>}
        </div>
      </div>
    </div>
  );
};

export default TipForm;
