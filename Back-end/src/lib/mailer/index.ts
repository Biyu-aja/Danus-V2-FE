// src/utils/Mailer.ts
import path from 'path';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import type { Transporter, SentMessageInfo, SendMailOptions } from 'nodemailer';

import { logger } from '../logger/index.js';
import { promises as fs } from 'fs';

type ViewPayload = Record<string, unknown>;

export interface SendViewMailOptions {
  from?: string;
  to: string | string[];
  subject: string;
  viewFile: string;                // relatif terhadap src/views/
  viewPayload?: ViewPayload;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: SendMailOptions['attachments'];
  headers?: SendMailOptions['headers'];
}

class Mailer {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILER_HOST,
      port: process.env.MAILER_PORT ? Number(process.env.MAILER_PORT) : undefined,
      secure: process.env.MAILER_SECURE === 'true', // opsional
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
      },
    } as any);
  }

  /**
   * Render file handlebars yang berada di `src/views/<fileName>`
   */
  async renderView(fileName: string, payload: ViewPayload = {}): Promise<string> {
    try {
      const filePath = path.resolve(process.cwd(), 'src', 'views', fileName);
      const file = await fs.readFile(filePath, { encoding: 'utf-8' });
      const template = handlebars.compile(file);
      return template(payload);
    } catch (error: any) {
      logger.error(error);
      throw new Error(`Failed to render view "${fileName}": ${error?.message ?? error}`);
    }
  }

  /**
   * Kirim email berbasis template handlebars.
   */
  async sendMail({
    from = `<${process.env.MAILER_USER}>`,
    to,
    subject,
    viewFile,
    viewPayload,
    cc,
    bcc,
    attachments,
    headers,
  }: SendViewMailOptions): Promise<SentMessageInfo> {
    const html = await this.renderView(viewFile, viewPayload ?? {});
    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
        cc,
        bcc,
        attachments,
        headers,
      });
      return info;
    } catch (error: any) {
      logger.error(error);
      throw new Error(`Failed to send mail: ${error?.message ?? error}`);
    }
  }
}

export default Mailer;
