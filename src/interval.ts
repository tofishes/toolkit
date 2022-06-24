const MS = 1000;
const VERTREFRESH = 60;

type Task = () => void;
type TaskDispatcher = {
  start: () => void;
  stop: () => void;
};
/**
 * isImmediate 是否立即执行，否则手动执行start()方法执行
 *
 * withNetwork 是否依赖网络执行，断网则不执行
 */
type IntervalConfig = {
  key?: string;
  isImmediate?: boolean;
  withNetwork?: boolean;
};

const noop = () => {};
const uniqueMap = new Map<string, boolean>();

function interval(
  fn: Task,
  delay: number,
  options: IntervalConfig = {}
): TaskDispatcher {
  const { isImmediate = true, withNetwork = false, key } = options;

  if (key) {
    if (uniqueMap.get(key)) {
      return {
        start: noop,
        stop: () => {
          uniqueMap.delete(key);
        },
      };
    }

    uniqueMap.set(key, true);
  }

  const frequency = Math.ceil((delay / MS) * VERTREFRESH);
  let tid: number;
  let isRuning = false;
  let times = -1;

  const action = () => {
    times++;
    tid = window.requestAnimationFrame(action);

    if (times % frequency === 0) {
      if (withNetwork && !navigator.onLine) {
        console.log("断网了，不执行interval任务");
        return;
      }

      fn();
    }
  };

  const run = () => {
    if (isRuning) {
      return;
    }

    isRuning = true;
    action();
  };

  if (isImmediate) {
    run();
  }

  return {
    start() {
      run();
    },
    stop() {
      key && uniqueMap.delete(key);
      window.cancelAnimationFrame(tid);
    },
  };
}

export default interval;
