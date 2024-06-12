import init_render from "./task/init-render"

(async () => {
  const tasks = [init_render]
  for (const task of tasks) {
    await task()
  }
})()