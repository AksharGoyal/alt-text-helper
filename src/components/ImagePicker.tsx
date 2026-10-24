import { useId, useState, type DragEvent } from 'react';
import { ACCEPTED_IMAGE_TYPES } from '../lib/imageFile';

type ImagePickerProps = {
  previewUrl: string | null;
  fileName: string | null;
  error: string | null;
  onFileChange: (file: File | undefined) => void;
};

export const ImagePicker = ({ previewUrl, fileName, error, onFileChange }: ImagePickerProps) => {
  const errorId = useId();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    onFileChange(event.dataTransfer.files[0]);
  };

  return (
    <div className="frame">
      <label
        className="dropzone"
        data-dragging={isDragging || undefined}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <span className="visually-hidden">Choose an image</span>
        <input
          className="visually-hidden"
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onFileChange(event.target.files?.[0])}
        />
        {previewUrl ? (
          <img src={previewUrl} alt="" width={400} height={300} />
        ) : (
          <span className="dropzone-prompt">
            <strong>Drop an image here</strong>
            <span>or click to choose a file</span>
          </span>
        )}
      </label>
      {fileName && <p className="frame-caption">{fileName}</p>}
      {error && (
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
