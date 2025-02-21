import clsx from "clsx";
import styles from "./KeyboardShortcuts.module.scss";

function KeyboardShortcuts() {
  return (
    <div className={clsx("card", styles.container)}>
      <div className="card-body">
        <h5 className="card-title">Keyboard shortcuts</h5>
        <h6 className="card-subtitle mt-3 mb-2 text-body-secondary">Search</h6>
        <div className={clsx("card-text", styles.legends)}>
          <div><kbd>Esc</kbd> clear/close search</div>
          <div><kbd>&#129033;</kbd> move up in results</div>
          <div><kbd>&#129035;</kbd> move down in results</div>
          <div><kbd>Enter</kbd> open result</div>
        </div>
        <h6 className="card-subtitle mt-3 mb-2 text-body-secondary">Viewing</h6>
        <div className={clsx("card-text", styles.legends)}>
          <div><kbd>Enter</kbd><kbd>Space</kbd> open search</div>
          <div><kbd>0</kbd> reset view</div>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcuts;