import { Component, type ReactNode } from "react";

interface Props {
  moduleName: string;
  onClose: () => void;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * One crashed module should cost you that one window, not the whole OS.
 * This is the fix the white-page bug actually called for: the store
 * merge fix (src/lib/store.ts) closed the specific hole that caused it,
 * but any future bug in any module's render would still take down the
 * entire React tree without this — there was no boundary anywhere.
 * React only resets a class error boundary's state on remount, so each
 * window instance gets its own boundary via a `key` in ModuleWindowContent.
 */
export default class WindowErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(`[${this.props.moduleName}] crashed:`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 h-full p-8 text-center">
          <p className="text-sm font-medium text-ci-text">{this.props.moduleName} hit an error and stopped.</p>
          <p className="text-xs text-ci-muted max-w-sm">
            The rest of Ci is unaffected — every other window keeps working. This one needs to be closed and
            reopened.
          </p>
          <p className="font-mono text-[11px] text-red-600 max-w-sm break-words">{this.state.error.message}</p>
          <button onClick={this.props.onClose} className="rounded-md bg-ci-accent px-4 py-1.5 text-xs font-medium text-white">
            Close this window
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
