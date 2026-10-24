# Alt text helper

Pick an image and get three to five alt text options for it. An open-weight captioning model runs in your browser, so the image never leaves your device. There is no server, no account and no API key.

## Why

Alt text is easy to skip and hard to write well. Most tools that suggest it send your image to a hosted API. This one runs the model locally with [Transformers.js](https://huggingface.co/docs/transformers.js), which keeps private images private and removes any cost or quota.

## Features

- Three to five distinct alt text options per image, shown as they are generated
- Character count for each option, with a note when it is long for alt text (over 125 characters)
- Model picker with two open models
- Copy button on every option
- Drag and drop or file picker, keyboard accessible, light and dark themes

## Models

| Model                                                                      | License    | Download     |
| -------------------------------------------------------------------------- | ---------- | ------------ |
| [DistilViT by Mozilla](https://huggingface.co/Mozilla/distilvit) (default) | Apache-2.0 | about 190 MB |
| [ViT-GPT2](https://huggingface.co/Xenova/vit-gpt2-image-captioning)        | Apache-2.0 | about 245 MB |

The model downloads on first use and is cached by the browser. Sizes are estimated from the quantized files in each repository.

ViT-GPT2 is Xenova's ONNX conversion of [nlpconnect/vit-gpt2-image-captioning](https://huggingface.co/nlpconnect/vit-gpt2-image-captioning), which is licensed Apache-2.0. The conversion repository does not state a license of its own.

## Run it

```bash
npm install
npm run dev
```

Node 22.12 or newer is required.

| Script                 | What it does                              |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the dev server                      |
| `npm run build`        | Type check and build to `dist`            |
| `npm run preview`      | Serve the build with its security headers |
| `npm test`             | Run the unit tests                        |
| `npm run lint`         | Lint with ESLint                          |
| `npm run typecheck`    | Type check with TypeScript                |
| `npm run format:check` | Check formatting with Prettier            |

## How it works

- `src/worker/caption.worker.ts` loads the model and runs it off the main thread, so the page stays responsive.
- The worker produces one beam search caption, then sampled captions until it has between three and five distinct ones. The library returns one caption per call, so the variety comes from repeated sampling.
- `src/hooks/captionReducer.ts` holds the state machine. Requests carry an id, so results from an earlier image or model are ignored.
- `src/lib/altText.ts` formats captions as sentences and removes duplicates.

## Deploy

The build is a static site. On Netlify, `netlify.toml` sets the build command and publish directory. The build also writes `dist/_headers`, which Netlify applies, including the Content Security Policy.

The ONNX runtime file is about 27 MB, which is above the per-file limit of some static hosts. Check your host's limit before choosing it.

## Privacy and security

Images are processed in your browser and are never uploaded. The page only contacts Hugging Face to download model files. See [SECURITY.md](SECURITY.md).

This project follows secure development practices that line up with SOC 2 principles, such as a strict Content Security Policy, no stored user data and pinned dependency updates. It has not been audited and is not SOC 2 certified.

## Limitations

- Captions are short and generic. Review each one and add context only you know, such as names and the purpose of the image.
- Small models can be wrong. They are a starting point, not a replacement for a person writing alt text.
- The first run needs a download of a couple of hundred megabytes.
- Inference runs on the CPU through WebAssembly, so each option takes a few seconds.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Commits follow [Conventional Commits](https://www.conventionalcommits.org).

## License

[MIT](LICENSE)
