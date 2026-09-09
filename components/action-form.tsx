"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

type BoundAction = (formData: FormData) => Promise<void>;

interface ActionEntry {
  run: BoundAction;
  message?: string;
}

type ActionFormProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
} & (
  | { action: BoundAction; successMessage?: string; actions?: undefined }
  | { actions: Record<string, ActionEntry>; action?: undefined; successMessage?: undefined }
);

/**
 * Drop-in replacement for `<form action={serverAction}>` that shows a toast
 * on success/failure and refreshes the route. Only for actions that DON'T
 * call redirect() server-side — Next's redirect() throws a signal that a
 * try/catch here would otherwise misreport as an error.
 *
 * For a row with two submit buttons (e.g. save + delete), pass `actions`
 * keyed by an intent name, and tag each button with `data-intent="<key>"`.
 */
export function ActionForm(props: ActionFormProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;

    let run: BoundAction;
    let message: string | undefined;

    if (props.actions) {
      const intent = submitter?.dataset.intent ?? Object.keys(props.actions)[0];
      const entry = props.actions[intent];
      run = entry.run;
      message = entry.message;
    } else {
      run = props.action;
      message = props.successMessage;
    }

    startTransition(async () => {
      try {
        await run(formData);
        if (message) showToast(message, "success");
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={props.style} className={props.className} aria-busy={isPending}>
      {props.children}
    </form>
  );
}
