import React, { useState, useEffect } from "react";
import { render, Text } from "ink";
import { searchPackages } from "../nuget-client/nuget-client.js";

const Counter = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {

    const timer = setInterval(() => {
      setCounter(previousCounter => previousCounter + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <Text color="green">{counter} tests passed</Text>;
};

export async function startApp(): Promise<void> {
  const result = await searchPackages("json");
  for (const r of result) {
    console.log(r.authors);
  }
  render(<Counter />);
}
