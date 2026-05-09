import { reactive } from "vue";

const state = reactive({
  status: "idle",
  error: null,
});

async function generate(prompt, onChunk) {
  state.status = "generating";
  state.error = null;

  try {
    const response = await fetch("http://localhost:8080/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || `Server error ${response.status}`);
    }

    onChunk(json.code);
    state.status = "idle";
    return json.code;
  } catch (err) {
    state.error = err.message;
    state.status = "error";
    throw err;
  }
}

async function improve(code, prompt) {
  state.status = "generating";
  state.error = null;

  try {
    const response = await fetch("http://localhost:8080/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, prompt }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || `Server error ${response.status}`);
    }

    state.status = "idle";
    return json.code;
  } catch (err) {
    state.error = err.message;
    state.status = "error";
    throw err;
  }
}

export default { state, generate, improve };
