export const REGISTER_MESSAGES = {
  topbarTitle: 'สมัครรับข่าวสารผ่าน LINE',
  heading: 'กรอกข้อมูลยืนยันตัวตน',
  subtext: 'กรอกเลขนิติบุคคล และ Email ที่ลงทะเบียนกับ SuperApp เพื่อยืนยันว่าคุณคือลูกค้าของเรา',
  emailLabel: 'Email',
  emailPlaceholder: 'example@email.com',
  idLabel: 'เลขนิติบุคคล',
  idPlaceholder: '0000000000000',
  idHelper: 'ตัวอย่าง: 0105563000012 (13 หลัก)',
  submitButton: 'ถัดไป',
  errors: {
    emailFormat: 'รูปแบบของ Email ไม่ถูกต้อง',
    idIncomplete: 'กรุณากรอกเลขนิติบุคคลให้ครบ 13 หลัก',
    emailNotFound: 'ไม่มี Email นี้อยู่ในระบบ',
    juristicNotFound: 'ไม่มีเลขนิติบุคคลนี้อยู่ในระบบ',
    bothEmail: 'กรุณาตรวจสอบ Email อีกครั้ง',
    bothId: 'กรุณาตรวจสอบเลขนิติบุคคลอีกครั้ง',
  },
  modalNotFound: {
    heading: 'ไม่พบข้อมูลในระบบ',
    body: 'ข้อมูลที่กรอกไม่ตรงกับลูกค้าที่ลงทะเบียนไว้กับ SuperApp กรุณาตรวจสอบ Email และเลขนิติบุคคลอีกครั้ง',
    button: 'ตรวจสอบอีกครั้ง',
  },
  modalNotLinked: {
    heading: 'Email นี้ยังไม่ได้เชื่อมต่อกับบัญชีนิติบุคคล',
    body: 'Email นี้ยังไม่ได้เชื่อมต่อกับบัญชีนิติบุคคล กรุณาใช้ Email อื่น',
    button: 'ตกลง',
  },
} as const;
