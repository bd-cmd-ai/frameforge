"use client";

import {
  createProviderImage,
  deleteProviderImage,
  setProviderHeroImage,
  updateProviderImage,
} from "@radar-domace/api";
import type { ProviderImage } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../../lib/supabase-browser";
import {
  buildProviderImagePublicUrl,
  PROVIDER_IMAGES_BUCKET,
  validateProviderImageFile,
} from "../../lib/uploads/provider-images";

export const ImageUploader = ({
  providerId,
  initialImages,
}: {
  providerId: string;
  initialImages: ProviderImage[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const sortedImages = useMemo(
    () => [...images].sort((left, right) => left.sortOrder - right.sortOrder),
    [images],
  );

  const saveImageState = async (nextImages: ProviderImage[]) => {
    const client = createWebBrowserSupabaseClient();
    const cover = nextImages.find((image) => image.isCover) ?? nextImages[0] ?? null;

    const updateResults = await Promise.all(
      nextImages.map((image, index) =>
        updateProviderImage(client, {
          id: image.id,
          sortOrder: index,
          isCover: cover ? cover.id === image.id : false,
        }),
      ),
    );

    const updateError = updateResults.find((result) => result.error)?.error;
    if (updateError) {
      setError(updateError);
      return;
    }

    const heroResult = await setProviderHeroImage(client, {
      providerId,
      storagePath: cover?.path ?? null,
    });

    if (heroResult.error) {
      setError(heroResult.error);
      return;
    }

    setImages(
      nextImages.map((image, index) => ({
        ...image,
        sortOrder: index,
        isCover: cover ? cover.id === image.id : false,
      })),
    );
    setFeedback("Image gallery updated.");
    router.refresh();
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setFeedback(null);

    const client = createWebBrowserSupabaseClient();

    for (const file of Array.from(files)) {
      const validation = validateProviderImageFile(file);
      if (validation) {
        setError(validation);
        return;
      }
    }

    startTransition(async () => {
      const created: ProviderImage[] = [];

      for (const file of Array.from(files)) {
        const path = `${providerId}/${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;
        const upload = await client.storage.from(PROVIDER_IMAGES_BUCKET).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (upload.error) {
          setError(upload.error.message);
          return;
        }

        const createdRow = await createProviderImage(client, {
          providerId,
          storagePath: path,
          sortOrder: images.length + created.length,
          isCover: images.length === 0 && created.length === 0,
        });

        if (!createdRow.data) {
          setError(createdRow.error ?? "Image record could not be created.");
          return;
        }

        created.push(createdRow.data);
      }

      const next = [...images, ...created];
      setImages(next);
      setFeedback("Images uploaded.");
      await saveImageState(next);
    });
  };

  const removeImage = (image: ProviderImage) =>
    startTransition(async () => {
      const client = createWebBrowserSupabaseClient();
      await client.storage.from(PROVIDER_IMAGES_BUCKET).remove([image.path]);
      const deleted = await deleteProviderImage(client, image.id);
      if (deleted.error) {
        setError(deleted.error);
        return;
      }
      const next = images.filter((entry) => entry.id !== image.id);
      await saveImageState(next);
    });

  const moveImage = (imageId: string, direction: -1 | 1) => {
    const index = sortedImages.findIndex((image) => image.id === imageId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= sortedImages.length) return;
    const next = [...sortedImages];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    startTransition(async () => {
      await saveImageState(next);
    });
  };

  const makePrimary = (imageId: string) => {
    const next = sortedImages.map((image) => ({ ...image, isCover: image.id === imageId }));
    startTransition(async () => {
      await saveImageState(next);
    });
  };

  return (
    <div className="stack-lg">
      <div className="upload-panel">
        <label className="field">
          <span>Upload images</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void uploadFiles(event.target.files)} />
        </label>
        <p className="muted">Use JPG, PNG, or WEBP. Maximum 5 MB per image.</p>
      </div>

      <div className="image-grid">
        {sortedImages.map((image, index) => (
          <div className="image-card" key={image.id}>
            <img src={buildProviderImagePublicUrl(image.path)} alt="" className="image-thumb" />
            <div className="stack-sm">
              <strong>{image.isCover ? "Primary image" : `Image ${index + 1}`}</strong>
              <div className="inline-actions">
                <button className="ghost-button" type="button" onClick={() => moveImage(image.id, -1)}>
                  Up
                </button>
                <button className="ghost-button" type="button" onClick={() => moveImage(image.id, 1)}>
                  Down
                </button>
                <button className="ghost-button" type="button" onClick={() => makePrimary(image.id)}>
                  Make primary
                </button>
                <button className="ghost-button" type="button" onClick={() => removeImage(image)} disabled={isPending}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {sortedImages.length === 0 ? (
        <div className="empty-state compact">
          <h3>No images uploaded yet</h3>
          <p>Add at least one landscape image so the profile looks complete in the app.</p>
        </div>
      ) : null}

      {error ? <p className="field-error">{error}</p> : null}
      {feedback ? <p className="field-success">{feedback}</p> : null}
    </div>
  );
};
