export const OTP_MESSAGES = {
  topbarTitle: 'สมัครรับข่าวสารผ่าน LINE',
  heading: 'กรอกรหัส OTP',
  sentToPrefix: 'ระบบได้ส่งรหัส OTP ไปยัง Email: ',
  refPrefix: 'Ref: ',
  expiry: (n: number) => `OTP มีอายุการใช้งาน ${n} นาที`,
  resend: 'ขอรหัสอีกครั้ง',
  resendCooldown: (s: number) => `ขอรหัสอีกครั้ง (รอ ${s} วินาที)`,
  submitButton: 'ยืนยัน',
  errorIncorrect: (n: number) => `กรอกรหัส OTP ไม่ถูกต้อง (กรอกได้อีก ${n} ครั้ง)`,
  errorExpired: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่อีกครั้ง',
  exceededModal: {
    heading: 'คุณกรอกรหัส OTP ไม่ถูกต้อง เกินจำนวนครั้งที่กำหนด',
    body: 'กรุณากดเริ่มกระบวนการลงทะเบียนใหม่อีกครั้ง หากใช้ Email เดิม กรุณารอ 15 นาที',
    button: 'กลับไปหน้ากรอกข้อมูลยืนยันตัวตน',
  },
} as const;
