async function main(): Promise<void> {
  console.log("Hej");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
