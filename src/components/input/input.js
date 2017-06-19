import $ from 'dom7';
import Utils from '../../utils/utils';

const Input = {
  ignoreTypes: ['checkbox', 'button', 'submit', 'range', 'radio', 'image'],
  textareaResizableShadow: undefined,
  resizeTextarea(textareaEl) {
    const app = this;
    const $textareaEl = $(textareaEl);
    const $shadowEl = Input.textareaResizableShadow;
    if (!$textareaEl.length) return;
    if (!$textareaEl.hasClass('resizable')) return;

    app.root.append($shadowEl);

    const styles = window.getComputedStyle($textareaEl[0]);
    ('padding margin width font border box-sizing display').split(' ').forEach((style) => {
      $shadowEl.css(style, styles[style]);
    });

    $shadowEl.val('');
    const initialHeight = $shadowEl[0].scrollHeight;

    $shadowEl.val($textareaEl.val());
    $shadowEl.css('height', 0);
    const scrollHeight = $shadowEl[0].scrollHeight;

    if (scrollHeight > initialHeight) {
      $textareaEl.css('height', `${scrollHeight}px`);
    } else {
      $textareaEl.css('height', '');
    }
    $shadowEl.remove();
  },
  validate(inputEl) {
    const $inputEl = $(inputEl);
    if (!$inputEl.length) return;
    const $itemInputEl = $inputEl.parents('.item-input');
    const validity = $inputEl[0].validity;
    const validationMessage = $inputEl.dataset().errorMessage || $inputEl[0].validationMessage || '';
    if (!validity) return;
    if (!validity.valid) {
      let $errorEl = $inputEl.nextAll('.item-input-error-message');
      if (validationMessage) {
        if ($errorEl.length === 0) {
          $errorEl = $('<div class="item-input-error-message"></div>');
          $errorEl.insertAfter($inputEl);
        }
        $errorEl.text(validationMessage);
      }
      if ($errorEl.length > 0) {
        $itemInputEl.addClass('item-input-with-error-message');
      }
      $itemInputEl.addClass('item-input-invalid');
      $inputEl.addClass('input-invalid');
    } else {
      $itemInputEl.removeClass('item-input-invalid item-input-with-error-message');
      $inputEl.removeClass('input-invalid');
    }
  },
  validateInputs(el) {
    const app = this;
    $(el).find('input, textarea, select').each((index, inputEl) => {
      app.input.validate(inputEl);
    });
  },
  focus(inputEl) {
    const $inputEl = $(inputEl);
    const type = $inputEl.attr('type');
    if (Input.ignoreTypes.indexOf(type) >= 0) return;
    const $itemInputEl = $inputEl.parents('.item-input');
    $itemInputEl.addClass('item-input-focused');
  },
  blur(inputEl) {
    $(inputEl).parents('.item-input').removeClass('item-input-focused');
  },
  checkEmptyState(inputEl) {
    const $inputEl = $(inputEl);
    const value = $inputEl.val();
    const $itemInputEl = $inputEl.parents('.item-input');
    if ((value && (typeof value === 'string' && value.trim() !== '')) || (Array.isArray(value) && value.length > 0)) {
      $itemInputEl.addClass('item-input-with-value');
    } else {
      $itemInputEl.removeClass('item-input-with-value');
    }
  },
  init() {
    const app = this;
    Input.textareaResizableShadow = $(document.createElement('textarea')).addClass('textarea-resizable-shadow');
    function onFocus() {
      app.input.focus(this);
    }
    function onBlur() {
      const $inputEl = $(this);
      app.input.blur($inputEl);
      if ($inputEl.dataset().validate || $inputEl.attr('validate') !== null) {
        app.input.validate($inputEl);
      }
    }
    function onChange() {
      const $inputEl = $(this);
      const type = $inputEl.attr('type');
      const tag = $inputEl[0].nodeName.toLowerCase();
      if (Input.ignoreTypes.indexOf(type) >= 0) return;

      // Check Empty State
      app.input.checkEmptyState($inputEl);

      // Check validation
      if ($inputEl.dataset().validate || $inputEl.attr('validate') !== null) {
        app.input.validate($inputEl);
      }

      // Resize textarea
      if (tag === 'textarea' && $inputEl.hasClass('resizable')) {
        app.input.resizeTextarea($inputEl);
      }
    }
    function onInvalid(e) {
      const $inputEl = $(this);
      if ($inputEl.dataset().validate || $inputEl.attr('validate') !== null) {
        e.preventDefault();
        app.input.validate($inputEl);
      }
    }
    $(document).on('change input', 'input, textarea, select', onChange, true);
    $(document).on('focus', 'input, textarea, select', onFocus, true);
    $(document).on('blur', 'input, textarea, select', onBlur, true);
    $(document).on('invalid', 'input, textarea, select', onInvalid, true);
  },
};

export default {
  name: 'input',
  create() {
    const app = this;
    Utils.extend(app, {
      input: {
        focus: Input.focus.bind(app),
        blur: Input.blur.bind(app),
        validate: Input.validate.bind(app),
        validateInputs: Input.validate.bind(app),
        checkEmptyState: Input.checkEmptyState.bind(app),
        resizeTextarea: Input.resizeTextarea.bind(app),
        init: Input.init.bind(app),
      },
    });
  },
  on: {
    init() {
      const app = this;
      app.input.init();
    },
    pageInit(page) {
      const app = this;
      const $pageEl = page.$el;
      $pageEl.find('.item-input').each((itemInputIndex, itemInputEl) => {
        const $itemInputEl = $(itemInputEl);
        $itemInputEl.find('input, select, textarea').each((inputIndex, inputEl) => {
          const $inputEl = $(inputEl);
          if (Input.ignoreTypes.indexOf($inputEl.attr('type')) >= 0) return;
          app.input.checkEmptyState($inputEl);
        });
      });
      $pageEl.find('textarea.resizable').each((textareaIndex, textareaEl) => {
        app.input.resizeTextarea(textareaEl);
      });
    },
  },
};