"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type NodeStatus = "ok" | "warning" | "error";

// Props for a node in the integration map, optionally linked to another node.
type IntegrationNodeProps = {
  id: string;
  label: string;
  name: string;
  status: NodeStatus;
  href: string;
  ringColor: string;
  pointsTo?: string;
};

type LineCoords = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

// Renders a labeled node and, when linked, draws a connector line to its target.
export default function IntegrationNode({
  id,
  label,
  name,
  status,
  href,
  ringColor,
  pointsTo,
}: IntegrationNodeProps) {
  const nodeRef = useRef<HTMLSpanElement | null>(null);
  const [line, setLine] = useState<LineCoords | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!pointsTo) {
      setLine(null);
      return;
    }

    const node = nodeRef.current;
    const containerElement = node?.closest<HTMLElement>(
      "[data-integration-container]"
    );

    if (!node || !containerElement) {
      setLine(null);
      return;
    }

    setContainer(containerElement);

    const updateLine = () => {
      const target = containerElement.querySelector<HTMLElement>(
        `[data-integration-node-id='${pointsTo}']`
      );

      if (!target) {
        setLine(null);
        return;
      }

      const containerRect = containerElement.getBoundingClientRect();
      const sourceRect = node.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const x1 = sourceRect.left + sourceRect.width / 2 - containerRect.left;
      const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top;
      const x2 = targetRect.left + targetRect.width / 2 - containerRect.left;
      const y2 = targetRect.top + targetRect.height / 2 - containerRect.top;

      setLine({ x1, y1, x2, y2 });
    };

    updateLine();
    window.addEventListener("resize", updateLine);

    const observer = new ResizeObserver(updateLine);
    observer.observe(containerElement);
    observer.observe(node);

    const target = containerElement.querySelector<HTMLElement>(
      `[data-integration-node-id='${pointsTo}']`
    );

    if (target) {
      observer.observe(target);
    }

    return () => {
      window.removeEventListener("resize", updateLine);
      observer.disconnect();
    };
  }, [pointsTo]);

  return (
    <>
      <span
        ref={nodeRef}
        className="group relative z-10"
        data-integration-node="true"
        data-integration-node-id={id}
      >
        <Link href={href} className="block">
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full border-4 bg-[color:var(--surface-2)] transition-transform group-hover:scale-105"
              style={{ borderColor: ringColor }}
              aria-label={`${name} status ${status}`}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--surface-3)]">
                <span className="text-lg font-semibold text-[color:var(--text-primary)]">
                  {label}
                </span>
              </div>
            </div>
            <div className="text-sm text-[color:var(--text-subtle)] group-hover:text-[color:var(--text-primary)]">
              {name}
            </div>
          </div>
        </Link>
      </span>
      {line && container
        ? createPortal(
            <svg
              className="pointer-events-none absolute inset-0 z-0 h-full w-full"
              width="100%"
              height="100%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                className="text-[color:var(--text-muted)]"
                vectorEffect="non-scaling-stroke"
              />
            </svg>,
            container
          )
        : null}
    </>
  );
}
