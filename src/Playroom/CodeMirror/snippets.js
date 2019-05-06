import React from 'react';
import extraTooltip from './extra-tooltip';
import dedent from 'dedent';
import styles from './snippets.less';

class Tooltip extends React.Component {
  componentDidMount() {
    this.props.cm.constructor.colorize();
  }

  componentDidUpdate() {
    this.props.cm.constructor.colorize();
  }

  render() {
    return (
      <pre data-lang="jsx" className={styles.pre}>
        {dedent(this.props.data.text)}
      </pre>
    );
  }
}

const addClass = (el, className) => {
  if (!el.className.includes(className)) {
    el.className += ` ${className}`;
  }
};

const showSnippets = (cm, config = {}, code, changeRenderedCode) => {
  const snippets = Object.keys(config).reduce((all, displayText) => {
    all.push({ text: config[displayText], displayText });
    return all;
  }, []);

  if (!snippets.length) {
    return;
  }

  const CodeMirror = cm.constructor;
  const pos = CodeMirror.Pos;
  const resetUI = () => {
    const old = document.body.querySelector('.snippet-input');

    if (old) {
      old.remove();
    }
  };
  const resetCode = () => {
    resetUI();
    changeRenderedCode(code);

    if (cm.state.completionActive) {
      cm.state.completionActive.close();
    }
  };

  cm.showHint({
    completeSingle: false,
    extraKeys: {
      Esc: resetCode
    },
    hint: () => {
      const cursor = cm.getCursor();
      const token = cm.getTokenAt(cursor);
      const start =
        token.type === 'tag bracket' ? token.start + 1 : token.start;
      const end = cursor.ch;
      const line = cursor.line;
      const currentWord = token.string;
      const list = snippets.filter(item => item.text.indexOf(currentWord) >= 0);
      const hint = {
        list: list.length ? list : snippets,
        from: pos(line, start),
        to: pos(line, end)
      };

      cm.on('endCompletion', resetCode);

      return extraTooltip(cm, hint, Tooltip, data => {
        resetUI();
        addClass(document.body.querySelector('.CodeMirror-hints'), 'snippets');
        const container = document.body.querySelector('.ReactCodeMirror');
        const input = document.createElement('div');
        input.className = 'snippet-input';
        input.innerText = currentWord;
        container.prepend(input);

        const lines = code.split('\n');

        lines[cursor.line] =
          lines[cursor.line].slice(0, cursor.ch) +
          data.text +
          lines[cursor.line].slice(cursor.ch);

        changeRenderedCode(lines.join('\n'));
      });
    }
  });
};

export default showSnippets;
