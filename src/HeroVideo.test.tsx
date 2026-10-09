import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HeroVideo from "./HeroVideo";

let mediaChange: () => void;
let reducedMotion: boolean;
let removeListener: ReturnType<typeof vi.fn>;

beforeEach(() => {
  reducedMotion = false;
  removeListener = vi.fn();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return reducedMotion;
      },
      addEventListener: vi.fn((_type, listener) => {
        mediaChange = listener;
      }),
      removeEventListener: removeListener,
    })),
  );
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event("pause"));
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Saffron hero video", () => {
  it("pre-renders a high-priority responsive poster without video downloads", () => {
    const html = renderToString(<HeroVideo />);
    const markup = document.createElement("div");
    markup.innerHTML = html;
    expect(markup.querySelector("img")).toHaveAttribute(
      "fetchpriority",
      "high",
    );
    expect(markup.querySelector("img")).toHaveAttribute("srcset");
    expect(markup.querySelector("video")).toHaveAttribute("preload", "none");
    expect(markup.querySelector("source")).toBeNull();
    expect(markup.querySelector("button")).toBeNull();
  });

  it("enables a silent, inline loop and lets visitors pause and resume it", async () => {
    const user = userEvent.setup();
    const { container } = render(<HeroVideo />);
    const video = container.querySelector("video")!;
    expect(video.autoplay).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.querySelectorAll("source")).toHaveLength(2);
    fireEvent.playing(video);
    expect(video).toHaveClass("is-playing");
    await user.click(
      screen.getByRole("button", { name: "Mettre la vidéo en pause" }),
    );
    expect(video.pause).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Lire la vidéo" }));
    expect(video.play).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("button", { name: "Mettre la vidéo en pause" }),
    ).toBeInTheDocument();
  });

  it("keeps the poster and omits sources and controls for reduced motion", () => {
    reducedMotion = true;
    const { container } = render(<HeroVideo />);
    expect(container.querySelector("source")).toBeNull();
    expect(container.querySelector("video")).not.toHaveAttribute("autoplay");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/images/hero-saffron.webp",
    );
  });

  it("responds to preference changes and removes its listener on unmount", () => {
    const { container, unmount } = render(<HeroVideo />);
    const video = container.querySelector("video")!;
    fireEvent.playing(video);
    act(() => {
      reducedMotion = true;
      mediaChange();
    });
    expect(video.pause).toHaveBeenCalled();
    expect(container.querySelector("video")).not.toHaveClass("is-playing");
    expect(container.querySelector("source")).toBeNull();
    act(() => {
      reducedMotion = false;
      mediaChange();
    });
    expect(container.querySelectorAll("source")).toHaveLength(2);
    unmount();
    expect(removeListener).toHaveBeenCalledWith("change", mediaChange);
  });

  it("allows MP4 fallback if WebM fails, and shows the poster if both fail", () => {
    const { container } = render(<HeroVideo />);
    fireEvent.error(container.querySelector('source[type="video/webm"]')!);
    expect(
      container.querySelector('source[type="video/mp4"]'),
    ).toBeInTheDocument();
    fireEvent.error(container.querySelector('source[type="video/mp4"]')!);
    expect(container.querySelector("source")).toBeNull();
    expect(container.querySelector("video")).not.toHaveClass("is-playing");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("keeps a play control when autoplay or manual playback is blocked", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(
      new Error("NotAllowedError"),
    );
    const user = userEvent.setup();
    render(<HeroVideo />);
    await user.click(screen.getByRole("button", { name: "Lire la vidéo" }));
    expect(
      screen.getByRole("button", { name: "Lire la vidéo" }),
    ).toBeInTheDocument();
  });

  it("returns to the poster after a video decoding error", () => {
    const { container } = render(<HeroVideo />);
    const video = container.querySelector("video")!;
    fireEvent.playing(video);
    fireEvent.error(video);
    expect(video).not.toHaveClass("is-playing");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
