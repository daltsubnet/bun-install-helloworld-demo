export function hello() {
  return "Hello from bun-install-helloworld-demo";
}

if (import.meta.main) {
  console.log(hello());
}
