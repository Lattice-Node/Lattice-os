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

export async function sendLoginNotificationEmail({
  to,
  userName,
  loginAt,
  ipAddress,
}: {
  to: string;
  userName: string;
  loginAt: string;
  ipAddress: string;
}) {
  await resend.emails.send({
    from: "Lattice <noreply@lattice-protocol.com>",
    to,
    subject: "【Lattice】ログインのお知らせ",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">
        <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px; color: #3b82f6;">◈</span>
          <span style="font-weight: 700; font-size: 18px;">Lattice</span>
        </div>

        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
          <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 4px; color: #1e40af;">ログインを検知しました</h2>
          <p style="font-size: 13px; color: #6b7280; margin: 0;">あなたのアカウントへのログインが確認されました。</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; color: #6b7280; width: 120px;">ユーザー名</td>
            <td style="padding: 10px 0; font-weight: 600;">${userName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; color: #6b7280;">ログイン日時</td>
            <td style="padding: 10px 0; font-weight: 600;">${loginAt}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280;">IPアドレス</td>
            <td style="padding: 10px 0; font-weight: 600;">${ipAddress}</td>
          </tr>
        </table>

        <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #92400e; margin: 0;">
            身に覚えのないログインの場合は、すぐにパスワードを変更し、
            <a href="mailto:support@lattice-protocol.com" style="color: #d97706;">サポートまでご連絡ください。</a>
          </p>
        </div>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
          このメールはLatticeのセキュリティ通知として自動送信されました。<br>
          <a href="https://lattice-protocol.com/dashboard" style="color: #3b82f6;">ダッシュボードを確認する</a>
        </p>
      </div>
    `,
  });
}