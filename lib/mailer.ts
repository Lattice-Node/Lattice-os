import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResultEmail({
  to,
  agentName,
  result,
}: {
  to: string;
  agentName: string;
  result: string;
}) {
  await resend.emails.send({
    from: "Lattice <noreply@lattice-protocol.com>",
    to,
    subject: `【Lattice】${agentName}の実行結果`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px;">◈</span>
          <span style="font-weight: 700; font-size: 18px; margin-left: 8px;">Lattice</span>
        </div>
        <h2 style="font-size: 20px; margin-bottom: 8px;">${agentName}の実行結果</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">定期実行が完了しました。</p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; white-space: pre-wrap; font-size: 14px; line-height: 1.7;">
${result}
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          このメールはLatticeの定期実行によって自動送信されました。<br>
          <a href="https://lattice-protocol.com/dashboard" style="color: #4d9fff;">定期実行を管理する</a>
        </p>
      </div>
    `,
  });
}
