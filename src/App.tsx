import { useState } from 'react';
import { ExternalLink } from './components/ExternalLink';
import { ImagePicker } from './components/ImagePicker';
import { ModelSelect } from './components/ModelSelect';
import { Suggestion } from './components/Suggestion';
import { useCaptioner } from './hooks/useCaptioner';
import { validateImage } from './lib/imageFile';
import { DEFAULT_MODEL_ID } from './lib/models';

type SelectedImage = { file: File; url: string };

export const App = () => {
  const { state, caption, reset } = useCaptioner();
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const imageError = image ? validateImage(image.file) : null;
  const isWorking = state.status === 'working';

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    if (image) URL.revokeObjectURL(image.url);
    setImage({ file, url: URL.createObjectURL(file) });
    reset();
  };

  const handleModelChange = (nextModelId: string) => {
    setModelId(nextModelId);
    reset();
  };

  return (
    <div className="page">
      <header className="masthead">
        <h1>Alt text helper</h1>
        <p>
          Pick an image and get a one-line description for its alt attribute. The model runs on your
          device, so your image never leaves this browser tab.
        </p>
      </header>

      <main className="workspace">
        <ImagePicker
          previewUrl={image?.url ?? null}
          fileName={image?.file.name ?? null}
          error={imageError}
          onFileChange={handleFileChange}
        />

        <form
          className="controls"
          onSubmit={(event) => {
            event.preventDefault();
            if (image && !imageError) caption(image.url, modelId);
          }}
        >
          <ModelSelect value={modelId} disabled={isWorking} onChange={handleModelChange} />
          <button type="submit" disabled={!image || imageError !== null || isWorking}>
            Suggest alt text
          </button>
          <Suggestion state={state} />
        </form>
      </main>

      <footer>
        <p>
          Built for{' '}
          <ExternalLink href="https://www.mlh.com/events/hacktoberfest-hack-day-ahmedabad-x-open-source-weekend">
            Hacktoberfest Hack Day Ahmedabad
          </ExternalLink>
          , part of <ExternalLink href="https://hacktoberfest.com">Hacktoberfest</ExternalLink>.
          Open source under the MIT license, with the{' '}
          <ExternalLink href="https://github.com/AksharGoyal/alt-text-helper">
            code on GitHub
          </ExternalLink>
          . Models run with{' '}
          <ExternalLink href="https://huggingface.co/docs/transformers.js">
            Transformers.js
          </ExternalLink>{' '}
          and come from Hugging Face.
        </p>
      </footer>
    </div>
  );
};
