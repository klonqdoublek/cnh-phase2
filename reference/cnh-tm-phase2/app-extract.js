function ProductShell({
  logo: c,
  nav: l = [],
  activeId: _,
  onSelect: T,
  footer: E,
  overlay: D,
  children: O,
}) {
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-shell`,
    children: [
      (0, import_jsx_runtime.jsxs)(Sidebar, {
        mode: `static`,
        open: !0,
        width: 320,
        className: `cnh-shell__panel`,
        children: [
          (0, import_jsx_runtime.jsx)(`div`, {
            className: `cnh-shell__top`,
            children: c,
          }),
          (0, import_jsx_runtime.jsx)(`nav`, {
            className: `cnh-shell__nav`,
            children: l.map((c, l) =>
              (0, import_jsx_runtime.jsxs)(
                `div`,
                {
                  className: `cnh-shell__group`,
                  children: [
                    c.label != null &&
                      (0, import_jsx_runtime.jsx)(`div`, {
                        className: `cnh-shell__group-label`,
                        children: (0, import_jsx_runtime.jsx)(`span`, {
                          children: c.label,
                        }),
                      }),
                    c.items.map((c) => {
                      let l = c.id === _;
                      return (0, import_jsx_runtime.jsx)(
                        `button`,
                        {
                          type: `button`,
                          onClick: () => T?.(c.id),
                          className: l
                            ? `cnh-shell__row cnh-shell__row--selected`
                            : `cnh-shell__row`,
                          children: (0, import_jsx_runtime.jsx)(`span`, {
                            className: `cnh-shell__row-label`,
                            children: c.label,
                          }),
                        },
                        c.id,
                      );
                    }),
                  ],
                },
                l,
              ),
            ),
          }),
          E != null &&
            (0, import_jsx_runtime.jsxs)(`div`, {
              className: `cnh-shell__foot`,
              children: [
                (0, import_jsx_runtime.jsx)(Divider, {}),
                (0, import_jsx_runtime.jsx)(`div`, {
                  className: `cnh-shell__foot-row`,
                  children: E,
                }),
              ],
            }),
        ],
      }),
      D,
      (0, import_jsx_runtime.jsx)(`main`, {
        className: `cnh-shell__main`,
        children: O,
      }),
    ],
  });
}
function ProfileRow({
  initials: c,
  name: l,
  role: _,
  onClick: T,
  expanded: E,
}) {
  return (0, import_jsx_runtime.jsxs)(`button`, {
    type: `button`,
    onClick: T,
    "aria-haspopup": `true`,
    "aria-expanded": !!E,
    className: `cnh-shell__profile`,
    children: [
      (0, import_jsx_runtime.jsx)(Avatar, {
        type: `text`,
        label: c,
        avatarShape: `circle`,
        size: 32,
        background: `var(--colorSurfaceAccentBlueDefault)`,
        textColor: `var(--colorTextAccentBlueDefault)`,
      }),
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-shell__profile-text`,
        children: [
          (0, import_jsx_runtime.jsx)(`span`, {
            className: `cnh-shell__profile-name`,
            children: l,
          }),
          (0, import_jsx_runtime.jsx)(`span`, {
            className: `cnh-shell__profile-role`,
            children: _,
          }),
        ],
      }),
    ],
  });
}
function Icon({
  slug: c,
  size: l = 24,
  color: _ = `var(--colorIconPrimaryDefault)`,
  className: T,
}) {
  let E = `url("/webds-icons/${c}-${l}.svg")`;
  return (0, import_jsx_runtime.jsx)(`span`, {
    "aria-hidden": !0,
    className: T,
    style: {
      display: `inline-block`,
      flexShrink: 0,
      width: l,
      height: l,
      backgroundColor: _,
      maskImage: E,
      WebkitMaskImage: E,
      maskSize: `${l}px ${l}px`,
      WebkitMaskSize: `${l}px ${l}px`,
      maskRepeat: `no-repeat`,
      WebkitMaskRepeat: `no-repeat`,
    },
  });
}
function ProfileMenu({
  initials: c,
  name: l,
  role: _,
  actions: T = [],
  onDismiss: E,
}) {
  let D = (0, import_react.useRef)(null);
  return (
    (0, import_react.useEffect)(() => {
      if (!E) return;
      let c = (c) => {
          let l = c.target;
          D.current?.contains(l) || l.closest(`.cnh-shell__profile`) || E();
        },
        l = (c) => {
          c.key === `Escape` && E();
        };
      return (
        document.addEventListener(`pointerdown`, c),
        document.addEventListener(`keydown`, l),
        () => {
          (document.removeEventListener(`pointerdown`, c),
            document.removeEventListener(`keydown`, l));
        }
      );
    }, [E]),
    (0, import_jsx_runtime.jsxs)(`div`, {
      ref: D,
      className: `cnh-profile-menu`,
      "aria-label": l,
      children: [
        (0, import_jsx_runtime.jsxs)(`div`, {
          className: `cnh-profile-menu__who`,
          children: [
            (0, import_jsx_runtime.jsx)(Avatar, {
              type: `text`,
              label: c,
              avatarShape: `circle`,
              size: 32,
              background: `var(--colorSurfaceAccentBlueDefault)`,
              textColor: `var(--colorTextAccentBlueDefault)`,
            }),
            (0, import_jsx_runtime.jsxs)(`div`, {
              className: `cnh-profile-menu__text`,
              children: [
                (0, import_jsx_runtime.jsx)(`span`, {
                  className: `cnh-profile-menu__name`,
                  children: l,
                }),
                (0, import_jsx_runtime.jsx)(`span`, {
                  className: `cnh-profile-menu__role`,
                  children: _,
                }),
              ],
            }),
          ],
        }),
        (0, import_jsx_runtime.jsx)(Divider, {
          className: `cnh-profile-menu__rule`,
        }),
        T.map((c) =>
          (0, import_jsx_runtime.jsx)(
            GhostButton,
            {
              label: c.label,
              appearance: `default`,
              width: `256px`,
              height: `44px`,
              hasRightIcon: !!c.iconSlug,
              icon: c.iconSlug
                ? (0, import_jsx_runtime.jsx)(Icon, {
                    slug: c.iconSlug,
                    size: 16,
                  })
                : void 0,
              onClick: c.onClick,
              className: `cnh-profile-menu__action`,
            },
            c.label,
          ),
        ),
      ],
    })
  );
}
function LogoutDialog({ open: c, onConfirm: l, onCancel: _ }) {
  return (0, import_jsx_runtime.jsx)(DialogPopup, {
    open: c,
    title: `You are about to log out`,
    width: `600px`,
    className: `cnh-logout-dialog`,
    titlePadding: `16px 16px 0`,
    contentPadding: `16px`,
    actionsPadding: `8px 16px 16px`,
    onClose: _,
    actions: [
      { label: `Log out`, variant: `outline`, onClick: l },
      { label: `Cancel`, variant: `filled`, onClick: _ },
    ],
    children: `Are you sure you want to log out?`,
  });
}
function useUniqueSelectNames(c = []) {
  (0, import_react.useEffect)(() => {
    let c = new Set();
    document.querySelectorAll(`.select-wrapper`).forEach((l, _) => {
      let T = l.querySelector(`[role="combobox"]`),
        E = l.querySelector(`label`);
      if (!T) return;
      let D = (E?.textContent ?? ``).trim().replace(/\*$/, ``).trim(),
        O =
          D.toLowerCase()
            .replace(/[^a-z0-9]+/g, `-`)
            .replace(/^-|-$/g, ``) || `select-${_}`;
      for (; c.has(O);) O = `${O}-${_}`;
      (c.add(O),
        (T.id = `${O}-select`),
        E
          ? ((E.id = `${O}-label`),
            E.setAttribute(`for`, T.id),
            T.setAttribute(`aria-labelledby`, E.id))
          : D &&
            (T.removeAttribute(`aria-labelledby`),
            T.setAttribute(`aria-label`, D)));
    });
  }, c);
}
var CHANNELS = [`Push notification`, `Email`, `SMS`],
  STATUSES = [`Inactive`, `Published`, `Draft`],
  SERVICE_CODE_LOV = [`NANOTI`, `NAOTP`, `NABATCH`, `NAMKTNOTI`, `NAMKTBATCH`],
  NOTIFICATION_GROUP_LOV = [
    `Transactions`,
    `Promotions`,
    `Services`,
    `Security`,
    `System updates`,
    `Reminders`,
    `Customer engagement`,
  ],
  SEED = [
    [
      `Promotion offer`,
      `แจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่ พร้อมเวลาและสถานที่`,
      [`Push notification`, `Email`],
      `Draft`,
      `M Credit Card`,
    ],
    [
      `Limit exceeded`,
      `แจ้งเตือนเมื่อชำระเงินไม่สำเร็จ พร้อมสาเหตุและวิธีแก้ไข`,
      [`SMS`],
      `Inactive`,
      `AIA`,
    ],
    [
      `Device registered`,
      `แจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่ พร้อมเวลาและสถานที่ พร้อมเวลาและสถานที่`,
      [`SMS`],
      `Published`,
      `AIA`,
    ],
    [
      `Login alert`,
      `แจ้งเตือนเมื่อเปิดใช้งานบัตรใหม่สำเร็จ`,
      [`Email`],
      `Draft`,
      `M Credit Card`,
    ],
    [
      `Limit exceeded`,
      `แจ้งเตือนเมื่อมีการผูกอุปกรณ์ใหม่เข้ากับบัญชี`,
      [`Push notification`, `Email`, `SMS`],
      `Draft`,
      `M Credit Card`,
    ],
    [
      `Device registered`,
      `แจ้งเตือนเมื่อเปิดใช้งานบัตรใหม่สำเร็จ`,
      [`Email`],
      `Draft`,
      `M Credit Card`,
    ],
    [
      `Promotion offer`,
      `แจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่ พร้อมเวลาและสถานที่`,
      [`Email`],
      `Draft`,
      `M Credit Card`,
    ],
    [
      `Transfer success`,
      `แจ้งเตือนเมื่อมีการผูกอุปกรณ์ใหม่เข้ากับบัญชี`,
      [`SMS`],
      `Draft`,
      `M Credit Card`,
    ],
    [
      `Promotion offer`,
      `แจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่ พร้อมเวลาและสถานที่`,
      [`Push notification`, `Email`],
      `Published`,
      `M Credit Card`,
    ],
    [
      `Transfer success`,
      `แจ้งเตือนเมื่อชำระเงินไม่สำเร็จ พร้อมสาเหตุและวิธีแก้ไข`,
      [`Push notification`, `Email`],
      `Draft`,
      `M Credit Card`,
    ],
    [
      `Transfer success`,
      `แจ้งเตือนเมื่อชำระเงินไม่สำเร็จ พร้อมสาเหตุและวิธีแก้ไข`,
      [`Push notification`, `Email`],
      `Draft`,
      `M Credit Card`,
    ],
  ],
  SERVICE_CODE = `NACVS`,
  TEMPLATES = Array.from({ length: 200 }, (c, l) => {
    let [_, T, E, D, O] = SEED[l % SEED.length];
    return {
      id: `TPL-${String(l + 1).padStart(4, `0`)}`,
      name: _,
      description: T,
      productName: O,
      serviceCode: SERVICE_CODE,
      channels: E,
      status: D,
      detail: {
        templateRefCode: `20260827${String(l + 1).padStart(4, `0`)}`,
        serviceCode: SERVICE_CODE_LOV[l % SERVICE_CODE_LOV.length],
        notificationGroup: `Transactions`,
        remark: `สำหรับลูกค้า Postpaid ทุกแพ็กเกจ`,
        pushTitleTh: `แจ้งเตือน${_}`,
        pushTitleEn: `${_} Notification`,
        pushBodyTh: T,
        pushBodyEn: `Notification body in English for ${_}.`,
        pushDeeplink: `bualuang://notification/detail`,
        emailSubjectTh: `แจ้งเตือน${_}`,
        emailSubjectEn: _,
        emailBodyTh: T,
        emailBodyEn: `NABKG`,
        emailDisplayNameTh: `https://cdn.bbl/th/0700123430.html`,
        emailDisplayNameEn: `https://cdn.bbl/th/0700123430.html`,
        emailFromAddress: ``,
        emailTemplateName: _.slice(0, 20),
        smsMessageTh: T,
        smsMessageEn: `Notification body in English for ${_}.`,
        createdBy: `Paratchaporn U.`,
        updatedBy: `Paratchaporn U.`,
        lastUpdated: `05 Mar 2026`,
      },
    };
  }),
  IMPORT_COPY = {
    title: `Import templates`,
    dropTitle: `Drag and drop .jsonl files here`,
    dropHint: `You can import one or more template files at a time`,
    browse: `Browse files`,
    format: `Invalid file format. Only .jsonl files can be imported`,
    structure: `Invalid template structure`,
    noFile: `Select at least one .jsonl file to import`,
    hasErrors: `Remove the files with errors to continue`,
    dropMore: `Drag and drop more .jsonl files here, or`,
    summary: (c, l) =>
      `${c} ${c === 1 ? `file` : `files`} · ${l} ${l === 1 ? `template` : `templates`}`,
    errorCount: (c) => `${c} with ${c === 1 ? `error` : `errors`}`,
    removeErrors: (c) =>
      `Remove ${c} ${c === 1 ? `file` : `files`} with errors`,
    tooMany: (c, l) =>
      `You can import up to ${c} files at a time. ${l} ${l === 1 ? `file was` : `files were`} not added`,
    uploading: `Importing templates…`,
    failTitle: `Unable to import templates`,
    failBody: `Please try again`,
    successTitle: `Templates imported`,
    successBody: (c) =>
      `${c} ${c === 1 ? `template was` : `templates were`} added as draft`,
  },
  IMPORT_FAIL_SENTINEL = `error`,
  isText = (c) => typeof c == `string` && c.trim() !== ``,
  text = (c) => (typeof c == `string` ? c : ``),
  CHANNEL_CODE = { PUSH: `Push notification`, EMAIL: `Email`, SMS: `SMS` },
  CODE_OF = Object.fromEntries(
    Object.entries(CHANNEL_CODE).map(([c, l]) => [l, c]),
  );
function structureProblem(c, l, _) {
  let T = _ ? ` (line ${l})` : ``;
  if (!c || typeof c != `object` || Array.isArray(c))
    return `Not a template object${T}`;
  let E = c;
  if (E.recordType !== `TEMPLATE`) return `Not a template record${T}`;
  if (!isText(E.templateName)) return `Missing templateName${T}`;
  if (!isText(E.description)) return `Missing description${T}`;
  let D = E.serviceCodes;
  if (!Array.isArray(D) || D.length === 0) return `Missing serviceCodes${T}`;
  if (!D.every((c) => SERVICE_CODE_LOV.includes(c)))
    return `Unknown service code${T}`;
  let O = E.channels;
  return !Array.isArray(O) || O.length === 0
    ? `Missing channels${T}`
    : O.every((c) => c in CHANNEL_CODE)
      ? Array.isArray(E.templateLanguages)
        ? null
        : `Missing templateLanguages${T}`
      : `Unknown channel${T}`;
}
function fromExport(c) {
  let l = (l) => c.templateLanguages.find((c) => c?.language === l) ?? {},
    _ = l(`en`),
    T = l(`th`),
    E = (c) => text(_[c]) || text(T[c]),
    D = c.serviceCodes[0];
  return {
    id: ``,
    name: c.templateName.trim(),
    description: c.description.trim(),
    productName: text(c.productName).trim(),
    serviceCode: D,
    channels: CHANNELS.filter((l) => c.channels.includes(CODE_OF[l])),
    status: `Draft`,
    detail: {
      templateRefCode: ``,
      serviceCode: D,
      notificationGroup: text(c.notificationGroupName),
      remark: text(c.remark),
      pushTitleTh: text(T.pushTitle),
      pushTitleEn: text(_.pushTitle),
      pushBodyTh: text(T.pushMessage),
      pushBodyEn: text(_.pushMessage),
      pushDeeplink: E(`pushDeepLink`),
      emailSubjectTh: text(T.emailSubject),
      emailSubjectEn: text(_.emailSubject),
      emailBodyTh: text(T.emailBody),
      emailBodyEn: text(_.emailBody),
      emailDisplayNameTh:
        text(T.emailFromDisplayName) || E(`emailFromDisplayName`),
      emailDisplayNameEn:
        text(_.emailFromDisplayName) || E(`emailFromDisplayName`),
      emailFromAddress: E(`emailFrom`),
      emailTemplateName: ``,
      smsMessageTh: text(T.smsMessage),
      smsMessageEn: text(_.smsMessage),
      createdBy: ``,
      updatedBy: ``,
      lastUpdated: ``,
    },
  };
}
var EMPTY_DETAIL = {
  templateRefCode: ``,
  serviceCode: ``,
  notificationGroup: ``,
  remark: ``,
  pushTitleTh: ``,
  pushTitleEn: ``,
  pushBodyTh: ``,
  pushBodyEn: ``,
  pushDeeplink: ``,
  emailSubjectTh: ``,
  emailSubjectEn: ``,
  emailBodyTh: ``,
  emailBodyEn: ``,
  emailDisplayNameTh: ``,
  emailDisplayNameEn: ``,
  emailFromAddress: ``,
  emailTemplateName: ``,
  smsMessageTh: ``,
  smsMessageEn: ``,
  createdBy: ``,
  updatedBy: ``,
  lastUpdated: ``,
};
function toExport(c) {
  let l = c.detail,
    _ = (c) => c || null,
    T = (c) => ({
      language: c,
      smsMessage: _(c === `th` ? l.smsMessageTh : l.smsMessageEn),
      emailFrom: _(l.emailFromAddress),
      emailFromDisplayName: _(
        c === `th` ? l.emailDisplayNameTh : l.emailDisplayNameEn,
      ),
      emailSubject: _(c === `th` ? l.emailSubjectTh : l.emailSubjectEn),
      emailBody: _(c === `th` ? l.emailBodyTh : l.emailBodyEn),
      emailAttachmentURL: null,
      pushGroup: null,
      pushTitle: _(c === `th` ? l.pushTitleTh : l.pushTitleEn),
      pushMessage: _(c === `th` ? l.pushBodyTh : l.pushBodyEn),
      pushDeepLink: _(l.pushDeeplink),
      alertReferenceName: null,
    });
  return {
    recordType: `TEMPLATE`,
    templateRefCode: l.templateRefCode,
    serviceCodes: [l.serviceCode || c.serviceCode],
    notificationGroupName: _(l.notificationGroup),
    templateName: c.name,
    channels: c.channels.map((c) => CODE_OF[c]),
    productName: _(c.productName),
    status: c.status === `Published` ? `ACTIVE` : c.status.toUpperCase(),
    description: c.description,
    remark: _(l.remark),
    templateLanguages: [T(`en`), T(`th`)],
    templateMaskingFields: [],
    templateDefaultFields: [],
  };
}
var FILE_EXT = `.jsonl`,
  toJsonl = (c) =>
    c.map((c) => JSON.stringify(c)).join(`
`) +
    `
`;
function parseTemplates(c, l) {
  if (!c.toLowerCase().endsWith(`.jsonl`))
    return { ok: !1, problem: `format`, message: IMPORT_COPY.format };
  let _ = l
    .split(/\r?\n/)
    .map((c, l) => ({ t: c.trim(), n: l + 1 }))
    .filter((c) => c.t);
  if (_.length === 0)
    return {
      ok: !1,
      problem: `structure`,
      message: `${IMPORT_COPY.structure}: the file has no templates`,
    };
  let T = _.length > 1,
    E = [];
  for (let { t: c, n: l } of _)
    try {
      E.push(JSON.parse(c));
    } catch {
      return {
        ok: !1,
        problem: `structure`,
        message: `${IMPORT_COPY.structure}: line ${l} is not valid JSON`,
      };
    }
  for (let c = 0; c < E.length; c++) {
    let l = structureProblem(E[c], _[c].n, T);
    if (l)
      return {
        ok: !1,
        problem: `structure`,
        message: `${IMPORT_COPY.structure}: ${l}`,
      };
  }
  return { ok: !0, templates: E.map(fromExport) };
}
async function checkFile(c) {
  return c.name.toLowerCase().endsWith(`.jsonl`)
    ? parseTemplates(c.name, await c.text())
    : { ok: !1, problem: `format`, message: IMPORT_COPY.format };
}
var IMPORT_PRESETS = [
    `initial`,
    `no-file`,
    `selected`,
    `invalid-format`,
    `invalid-structure`,
    `uploading`,
    `failure`,
    `success`,
  ],
  demo = (c, l, _, T, E) =>
    toExport({
      id: ``,
      name: c,
      description: l,
      productName: _,
      serviceCode: E,
      channels: T,
      status: `Published`,
      detail: { ...EMPTY_DETAIL, serviceCode: E },
    }),
  VALID_FILES = [
    {
      name: `card-payment-due.jsonl`,
      text: toJsonl([
        demo(
          `Card payment due`,
          `แจ้งเตือนก่อนถึงวันครบกำหนดชำระบัตรเครดิต`,
          `M Credit Card`,
          [`Push notification`, `Email`],
          `NANOTI`,
        ),
      ]),
    },
    {
      name: `login-otp.jsonl`,
      text: toJsonl([
        demo(
          `Login OTP`,
          `ส่งรหัส OTP เพื่อยืนยันการเข้าสู่ระบบ`,
          `Bualuang mBanking`,
          [`SMS`],
          `NAOTP`,
        ),
      ]),
    },
    {
      name: `statements.jsonl`,
      text: toJsonl([
        demo(
          `Monthly statement ready`,
          `แจ้งเมื่อ e-Statement ประจำเดือนพร้อมให้ดาวน์โหลด`,
          `M Credit Card`,
          [`Email`],
          `NABATCH`,
        ),
        demo(
          `Insurance renewal`,
          `แจ้งเตือนต่ออายุกรมธรรม์ประกันล่วงหน้า 30 วัน`,
          `AIA`,
          [`Email`, `SMS`],
          `NAMKTBATCH`,
        ),
      ]),
    },
  ],
  BAD_FORMAT = {
    name: `customers.csv`,
    text: `name,description
Promotion offer,not a template`,
  },
  BAD_STRUCTURE = {
    name: `broken-template.jsonl`,
    text: toJsonl([{ ...demo(`No channels`, `x`, `AIA`, [], `NANOTI`) }]),
  };
function presetFiles(c) {
  return c === `initial` || c === `no-file`
    ? []
    : c === `invalid-format`
      ? [BAD_FORMAT, ...VALID_FILES]
      : c === `invalid-structure`
        ? [BAD_STRUCTURE, ...VALID_FILES]
        : VALID_FILES;
}
var presetTemplates = () =>
    VALID_FILES.flatMap((c) => {
      let l = parseTemplates(c.name, c.text);
      return l.ok ? l.templates : [];
    }),
  UPLOAD_MS = 1200,
  sizeLabel$1 = (c) =>
    c < 1024 ? `${c} B` : `${(c / 1024).toFixed(+(c < 10240))} KB`,
  isBad = (c) => c.check !== null && !c.check.ok;
function ImportDialog({ open: c, onClose: l, onImported: _, preset: T }) {
  let [E, D] = (0, import_react.useState)([]),
    [O, A] = (0, import_react.useState)(`idle`),
    [j, M] = (0, import_react.useState)(null),
    [N, F] = (0, import_react.useState)(!1),
    I = (0, import_react.useRef)(null),
    L = (0, import_react.useRef)(0),
    R = O === `uploading`;
  (0, import_react.useEffect)(() => {
    !c ||
      !T ||
      (D(
        presetFiles(T).map(({ name: c, text: l }) => ({
          key: L.current++,
          file: new File([l], c, {
            type: c.endsWith(`.jsonl`) ? `application/jsonl` : `text/csv`,
          }),
          check: parseTemplates(c, l),
        })),
      ),
      A(T === `uploading` ? `uploading` : T === `failure` ? `failed` : `idle`),
      M(T === `no-file` ? IMPORT_COPY.noFile : null));
  }, [c, T]);
  let z = E.filter(isBad),
    B = E.reduce((c, l) => c + (l.check?.ok ? l.check.templates.length : 0), 0),
    V = [...z, ...E.filter((c) => !isBad(c))],
    H = () => {
      (D([]), A(`idle`), M(null), F(!1));
    },
    U = () => {
      R || (H(), l());
    },
    W = (c) => {
      if (!c?.length) return;
      let l = Array.from(c),
        _ = l.slice(0, Math.max(0, 50 - E.length)),
        T = l.length - _.length,
        O = _.map((c) => ({ key: L.current++, file: c, check: null }));
      (D((c) => [...c, ...O]),
        M(T > 0 ? IMPORT_COPY.tooMany(50, T) : null),
        A(`idle`),
        O.forEach(({ key: c, file: l }) =>
          checkFile(l).then((l) =>
            D((_) => _.map((_) => (_.key === c ? { ..._, check: l } : _))),
          ),
        ));
    },
    G = (c) => {
      (D((l) => l.filter((l) => !c.includes(l.key))), M(null), A(`idle`));
    },
    K = () => {
      if (E.length === 0) return M(IMPORT_COPY.noFile);
      if (E.some((c) => !c.check || !c.check.ok))
        return M(IMPORT_COPY.hasErrors);
      (M(null), A(`uploading`));
      let c = E.some((c) =>
        c.file.name.toLowerCase().includes(IMPORT_FAIL_SENTINEL),
      );
      window.setTimeout(() => {
        if (c) return A(`failed`);
        let l = E.flatMap((c) => (c.check?.ok ? c.check.templates : []));
        (H(), _(l));
      }, UPLOAD_MS);
    },
    q = {
      onDragOver: (c) => {
        (c.preventDefault(), F(!0));
      },
      onDragLeave: () => F(!1),
      onDrop: (c) => {
        (c.preventDefault(), F(!1), W(c.dataTransfer.files));
      },
    },
    J = `${N ? ` is-dragging` : ``}${j === IMPORT_COPY.noFile ? ` is-error` : ``}`,
    X = (c) =>
      (0, import_jsx_runtime.jsx)(OutlineButton$1, {
        label: IMPORT_COPY.browse,
        height: c,
        onClick: () => I.current?.click(),
      });
  return (0, import_jsx_runtime.jsx)(DialogPopup, {
    open: c,
    title: IMPORT_COPY.title,
    width: `800px`,
    className: `cnh-list__dialog cnh-import`,
    titlePadding: `16px 16px 0`,
    contentPadding: `16px`,
    actionsPadding: `8px 16px 16px`,
    closeOnBackdropClick: !R,
    onClose: U,
    actions: [
      { label: `Cancel`, variant: `outline`, disabled: R, onClick: U },
      { label: `Import`, variant: `filled`, disabled: R, onClick: K },
    ],
    children: (0, import_jsx_runtime.jsxs)(`div`, {
      className: `cnh-import__body`,
      children: [
        R &&
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `cnh-import__uploading`,
            role: `status`,
            "aria-live": `polite`,
            children: [
              (0, import_jsx_runtime.jsx)(SpinnerLoader, {
                size: `L`,
                appearance: `brand`,
              }),
              (0, import_jsx_runtime.jsx)(`p`, {
                className: `cnh-import__uploading-title`,
                children: IMPORT_COPY.uploading,
              }),
            ],
          }),
        O === `failed` &&
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `cnh-import__fail`,
            role: `alert`,
            children: [
              (0, import_jsx_runtime.jsx)(Icon, {
                slug: `caution`,
                size: 24,
                color: `var(--colorIconNegativeDefault)`,
              }),
              (0, import_jsx_runtime.jsxs)(`div`, {
                children: [
                  (0, import_jsx_runtime.jsx)(`p`, {
                    className: `cnh-import__fail-title`,
                    children: IMPORT_COPY.failTitle,
                  }),
                  (0, import_jsx_runtime.jsx)(`p`, {
                    className: `cnh-import__fail-body`,
                    children: IMPORT_COPY.failBody,
                  }),
                ],
              }),
            ],
          }),
        E.length === 0
          ? (0, import_jsx_runtime.jsxs)(`div`, {
              className: `cnh-import__drop${J}`,
              ...q,
              children: [
                (0, import_jsx_runtime.jsx)(Icon, {
                  slug: `share`,
                  size: 32,
                  color: `var(--colorIconHighlightDefault)`,
                }),
                (0, import_jsx_runtime.jsx)(`p`, {
                  className: `cnh-import__drop-title`,
                  children: IMPORT_COPY.dropTitle,
                }),
                (0, import_jsx_runtime.jsx)(`p`, {
                  className: `cnh-import__drop-hint`,
                  children: IMPORT_COPY.dropHint,
                }),
                X(`36px`),
              ],
            })
          : (0, import_jsx_runtime.jsxs)(`div`, {
              className: `cnh-import__drop-bar${J}`,
              ...q,
              children: [
                (0, import_jsx_runtime.jsx)(Icon, {
                  slug: `share`,
                  size: 24,
                  color: `var(--colorIconHighlightDefault)`,
                }),
                (0, import_jsx_runtime.jsx)(`p`, {
                  className: `cnh-import__drop-hint`,
                  children: IMPORT_COPY.dropMore,
                }),
                X(`32px`),
              ],
            }),
        (0, import_jsx_runtime.jsx)(`input`, {
          ref: I,
          type: `file`,
          accept: `.jsonl`,
          multiple: !0,
          hidden: !0,
          onChange: (c) => {
            (W(c.target.files), (c.target.value = ``));
          },
        }),
        E.length > 0 &&
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `cnh-import__summary`,
            children: [
              (0, import_jsx_runtime.jsxs)(`p`, {
                className: `cnh-import__summary-text`,
                children: [
                  IMPORT_COPY.summary(E.length, B),
                  z.length > 0 &&
                    (0, import_jsx_runtime.jsxs)(`span`, {
                      className: `cnh-import__summary-errors`,
                      children: [` · `, IMPORT_COPY.errorCount(z.length)],
                    }),
                ],
              }),
              z.length > 0 &&
                (0, import_jsx_runtime.jsx)(GhostButton, {
                  label: IMPORT_COPY.removeErrors(z.length),
                  appearance: `negative`,
                  height: `32px`,
                  onClick: () => G(z.map((c) => c.key)),
                }),
            ],
          }),
        E.length > 0 &&
          (0, import_jsx_runtime.jsx)(`ul`, {
            className: `cnh-import__files`,
            "aria-label": `Selected files`,
            children: V.map(({ key: c, file: l, check: _ }) => {
              let T = _
                ? _.ok
                  ? `${sizeLabel$1(l.size)} · ${_.templates.length} ${_.templates.length === 1 ? `template` : `templates`}`
                  : _.message
                : `Checking…`;
              return (0, import_jsx_runtime.jsxs)(
                `li`,
                {
                  className: `cnh-import__file${_ && !_.ok ? ` is-error` : ``}`,
                  children: [
                    (0, import_jsx_runtime.jsx)(Icon, {
                      slug: `documents`,
                      size: 24,
                      color:
                        _ && !_.ok
                          ? `var(--colorIconNegativeDefault)`
                          : `var(--colorIconSecondaryDefault)`,
                    }),
                    (0, import_jsx_runtime.jsx)(`p`, {
                      className: `cnh-import__file-name`,
                      title: l.name,
                      children: l.name,
                    }),
                    (0, import_jsx_runtime.jsx)(`p`, {
                      className: `cnh-import__file-meta`,
                      title: T,
                      children: T,
                    }),
                    (0, import_jsx_runtime.jsx)(IconButton, {
                      size: `16`,
                      icon: (0, import_jsx_runtime.jsx)(Icon, {
                        slug: `close`,
                        size: 16,
                        color: `currentColor`,
                      }),
                      "aria-label": `Remove ${l.name}`,
                      onClick: () => G([c]),
                    }),
                  ],
                },
                c,
              );
            }),
          }),
        j &&
          (0, import_jsx_runtime.jsx)(InlineMessage, {
            appearance: `negative`,
            size: `s`,
            text: j,
          }),
      ],
    }),
  });
}
var TONE$1 = { Published: `positive`, Inactive: `disabled`, Draft: `caution` },
  EMPTY$1 = `–`,
  FAIL_QUERY = `error`,
  NOTICES = {
    published: {
      title: `Notification created`,
      description: `Your notification status is published`,
    },
    draft: {
      title: `Draft saved`,
      description: `You can continue editing this draft and publish it later`,
    },
    updated: {
      title: `Changes saved`,
      description: `The information has been updated`,
    },
  };
function Dashboard({
  templates: c,
  state: l = `ready`,
  onRetry: _,
  onCreate: T,
  onOpenTemplate: E,
  notice: D = null,
  onNoticeClose: O,
  downloadRequest: A = null,
  onDownloadRequestHandled: j,
  onImport: M,
  importPreset: N,
}) {
  let [F, I] = (0, import_react.useState)(``),
    [L, R] = (0, import_react.useState)([...SERVICE_CODE_LOV]),
    [z, B] = (0, import_react.useState)([...CHANNELS]),
    [V, H] = (0, import_react.useState)([...STATUSES]),
    [U, W] = (0, import_react.useState)(0),
    [G, K] = (0, import_react.useState)(new Set()),
    [q, J] = (0, import_react.useState)(null),
    [X, Z] = (0, import_react.useState)(!1),
    [Q, $] = (0, import_react.useState)(!1),
    [ee, te] = (0, import_react.useState)(!1),
    [ne, re] = (0, import_react.useState)(null),
    ie = (0, import_react.useRef)(!1),
    ae = (0, import_react.useRef)(M);
  ((ae.current = M),
    (0, import_react.useEffect)(() => {
      if (!N) return;
      if (N !== `success`) return te(!0);
      if (ie.current) return;
      ie.current = !0;
      let c = presetTemplates();
      (ae.current?.(c), re(c.length));
    }, [N]));
  let oe = () => K(new Set());
  (useUniqueSelectNames([l]),
    (0, import_react.useEffect)(() => {
      A && (J([A]), j?.());
    }, [A, j]));
  let se = F.trim().toLowerCase() === FAIL_QUERY,
    ce = (0, import_react.useMemo)(() => {
      let l = F.trim().toLowerCase(),
        _ = (c) => Date.parse(c.detail.lastUpdated) || 0;
      return [...c]
        .sort((c, l) => _(l) - _(c))
        .filter((c) => {
          let _ =
              !l ||
              c.name.toLowerCase().includes(l) ||
              c.description.toLowerCase().includes(l) ||
              c.productName.toLowerCase().includes(l),
            T =
              z.length === CHANNELS.length ||
              z.length === 0 ||
              c.channels.some((c) => z.includes(c)),
            E = V.length === 0 || V.includes(c.status),
            D =
              L.length === SERVICE_CODE_LOV.length ||
              L.length === 0 ||
              L.includes(c.detail.serviceCode);
          return _ && T && E && D;
        });
    }, [c, F, z, V, L]),
    le = Math.max(1, Math.ceil(ce.length / 50)),
    ue = Math.min(U, le - 1),
    de = ce.slice(ue * 50, ue * 50 + 50),
    fe = (c) =>
      K((l) => {
        let _ = new Set(l);
        return (_.has(c) ? _.delete(c) : _.add(c), _);
      }),
    pe = () =>
      K((c) => {
        let l = de.length > 0 && de.every((l) => c.has(l.id)),
          _ = new Set(c);
        return (de.forEach((c) => (l ? _.delete(c.id) : _.add(c.id))), _);
      }),
    me = () => K(new Set(ce.map((c) => c.id))),
    he = ce.length > 0 && ce.every((c) => G.has(c.id)),
    ge =
      de.length > 0 && de.every((c) => G.has(c.id))
        ? `checked`
        : de.some((c) => G.has(c.id))
          ? `indeterminate`
          : `none`,
    _e = (c) => {
      (c(), W(0), oe());
    },
    ve = (0, import_jsx_runtime.jsxs)(`div`, {
      className: `cnh-list__filters`,
      children: [
        (0, import_jsx_runtime.jsx)(`div`, {
          className: `cnh-list__search`,
          children: (0, import_jsx_runtime.jsx)(SearchField, {
            placeholder: `Search by notification name, description or product name`,
            value: F,
            collapseOnFocus: !1,
            onChange: (c) => _e(() => I(c)),
            onClear: () => _e(() => I(``)),
            "aria-label": `Search by notification name, description or product name`,
          }),
        }),
        (0, import_jsx_runtime.jsx)(FilterSelect, {
          label: `Service code`,
          options: SERVICE_CODE_LOV,
          value: L,
          onChange: (c) => _e(() => R(c)),
        }),
        (0, import_jsx_runtime.jsx)(FilterSelect, {
          label: `Channel`,
          options: [...CHANNELS],
          value: z,
          onChange: (c) => _e(() => B(c)),
        }),
        (0, import_jsx_runtime.jsx)(FilterSelect, {
          label: `Status`,
          options: [...STATUSES],
          value: V,
          onChange: (c) => _e(() => H(c)),
        }),
        (0, import_jsx_runtime.jsx)(`div`, {
          className: `cnh-list__clear`,
          children: (0, import_jsx_runtime.jsx)(GhostButton, {
            label: `Clear`,
            appearance: `highlight`,
            width: `72px`,
            height: `44px`,
            onClick: () =>
              _e(() => {
                (I(``),
                  R([...SERVICE_CODE_LOV]),
                  B([...CHANNELS]),
                  H([...STATUSES]));
              }),
          }),
        }),
      ],
    }),
    ye = (c) =>
      (0, import_jsx_runtime.jsx)(`div`, {
        className: `cnh-list__card-wrap`,
        children: (0, import_jsx_runtime.jsx)(`div`, {
          className: `cnh-list__card`,
          children: c,
        }),
      }),
    be = (c) =>
      (0, import_jsx_runtime.jsx)(`div`, {
        className: `cnh-list__centred`,
        children: c,
      }),
    xe = null;
  return (
    (xe = se
      ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
          children: [
            ve,
            ye(
              be(
                (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
                  children: [
                    (0, import_jsx_runtime.jsx)(`img`, {
                      src: `/illustrations/error.svg`,
                      alt: ``,
                      width: 124,
                      height: 124,
                    }),
                    (0, import_jsx_runtime.jsxs)(`div`, {
                      className: `cnh-list__state-block`,
                      children: [
                        (0, import_jsx_runtime.jsx)(`p`, {
                          className: `cnh-list__state-line`,
                          children: `Unable to get information`,
                        }),
                        (0, import_jsx_runtime.jsx)(Button, {
                          label: `Try again`,
                          onClick: () => _e(() => I(``)),
                        }),
                      ],
                    }),
                  ],
                }),
              ),
            ),
          ],
        })
      : l === `loading`
        ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
            children: [
              ve,
              ye(
                (0, import_jsx_runtime.jsx)(`div`, {
                  className: `cnh-list__spinner`,
                  children: (0, import_jsx_runtime.jsx)(SpinnerLoader, {
                    size: `L`,
                    appearance: `brand`,
                  }),
                }),
              ),
            ],
          })
        : l === `error`
          ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
              children: [
                ve,
                ye(
                  be(
                    (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
                      children: [
                        (0, import_jsx_runtime.jsx)(`img`, {
                          src: `/illustrations/error.svg`,
                          alt: ``,
                          width: 124,
                          height: 124,
                        }),
                        (0, import_jsx_runtime.jsxs)(`div`, {
                          className: `cnh-list__state-block`,
                          children: [
                            (0, import_jsx_runtime.jsx)(`p`, {
                              className: `cnh-list__state-line`,
                              children: `Unable to get information`,
                            }),
                            (0, import_jsx_runtime.jsx)(Button, {
                              label: `Try again`,
                              onClick: _,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ),
                ),
              ],
            })
          : l === `empty`
            ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
                children: [
                  ve,
                  ye(
                    be(
                      (0, import_jsx_runtime.jsxs)(
                        import_jsx_runtime.Fragment,
                        {
                          children: [
                            (0, import_jsx_runtime.jsx)(`img`, {
                              src: `/illustrations/empty.svg`,
                              alt: ``,
                              width: 124,
                              height: 124,
                            }),
                            (0, import_jsx_runtime.jsxs)(`div`, {
                              className: `cnh-list__state-block`,
                              children: [
                                (0, import_jsx_runtime.jsx)(`p`, {
                                  className: `cnh-list__state-title`,
                                  children: `No notifications created yet`,
                                }),
                                (0, import_jsx_runtime.jsx)(`p`, {
                                  className: `cnh-list__state-line`,
                                  children: `Get started by creating notifications to keep users informed through push notification, email and SMS`,
                                }),
                                (0, import_jsx_runtime.jsx)(Button, {
                                  label: `Create notification`,
                                  hasIcon: !0,
                                  icon: (0, import_jsx_runtime.jsx)(Icon, {
                                    slug: `plus`,
                                    size: 16,
                                    color: `currentColor`,
                                  }),
                                  onClick: T,
                                }),
                              ],
                            }),
                          ],
                        },
                      ),
                    ),
                  ),
                ],
              })
            : (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
                children: [
                  ve,
                  (0, import_jsx_runtime.jsx)(`div`, {
                    className: `cnh-list__table-scroll`,
                    children:
                      de.length === 0
                        ? (0, import_jsx_runtime.jsx)(`div`, {
                            className: `cnh-list__card-wrap`,
                            children: (0, import_jsx_runtime.jsx)(`div`, {
                              className: `cnh-list__card`,
                              children: be(
                                (0, import_jsx_runtime.jsxs)(
                                  import_jsx_runtime.Fragment,
                                  {
                                    children: [
                                      (0, import_jsx_runtime.jsx)(`img`, {
                                        src: `/illustrations/no-results.svg`,
                                        alt: ``,
                                        width: 124,
                                        height: 124,
                                      }),
                                      (0, import_jsx_runtime.jsx)(`p`, {
                                        className: `cnh-list__state-line`,
                                        children: `No results found`,
                                      }),
                                    ],
                                  },
                                ),
                              ),
                            }),
                          })
                        : (0, import_jsx_runtime.jsxs)(
                            import_jsx_runtime.Fragment,
                            {
                              children: [
                                G.size > 0 &&
                                  (0, import_jsx_runtime.jsxs)(`div`, {
                                    className: `cnh-list__selection`,
                                    children: [
                                      (0, import_jsx_runtime.jsx)(`span`, {
                                        className: `cnh-list__selection-text`,
                                        children: `${G.size} item${G.size === 1 ? `` : `s`} selected`,
                                      }),
                                      (0, import_jsx_runtime.jsx)(`span`, {
                                        "aria-hidden": !0,
                                        className: `cnh-list__selection-rule`,
                                      }),
                                      (0, import_jsx_runtime.jsx)(`div`, {
                                        className: `cnh-list__selection-grow`,
                                        children: (0, import_jsx_runtime.jsx)(
                                          GhostButton,
                                          {
                                            label: he
                                              ? `Clear selection`
                                              : `Select all items`,
                                            appearance: `highlight`,
                                            padding: `none`,
                                            onClick: he ? oe : me,
                                          },
                                        ),
                                      }),
                                      (0, import_jsx_runtime.jsx)(GhostButton, {
                                        label: `Download selected items`,
                                        appearance: `highlight`,
                                        padding: `none`,
                                        hasRightIcon: !0,
                                        icon: (0, import_jsx_runtime.jsx)(
                                          Icon,
                                          {
                                            slug: `download`,
                                            size: 16,
                                            color: `currentColor`,
                                          },
                                        ),
                                        onClick: () =>
                                          J(ce.filter((c) => G.has(c.id))),
                                      }),
                                    ],
                                  }),
                                (0, import_jsx_runtime.jsx)(TableContainer, {
                                  className: `cnh-list__table`,
                                  children: (0, import_jsx_runtime.jsxs)(
                                    Table,
                                    {
                                      "aria-label": `Notification management`,
                                      children: [
                                        (0, import_jsx_runtime.jsxs)(
                                          `colgroup`,
                                          {
                                            children: [
                                              (0, import_jsx_runtime.jsx)(
                                                `col`,
                                                { style: { width: 56 } },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                `col`,
                                                { style: { width: 240 } },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                `col`,
                                                { style: { width: 450 } },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                `col`,
                                                { style: { width: 213.5 } },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                `col`,
                                                { style: { width: 213.5 } },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                `col`,
                                                { style: { width: 213.5 } },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                `col`,
                                                { style: { width: 213.5 } },
                                              ),
                                            ],
                                          },
                                        ),
                                        (0, import_jsx_runtime.jsx)(TableHead, {
                                          children: (0,
                                          import_jsx_runtime.jsxs)(TableRow, {
                                            heights: `64px`,
                                            headerRowColor: `var(--colorSurfacePrimaryHovered)`,
                                            children: [
                                              (0, import_jsx_runtime.jsx)(
                                                TableCell,
                                                {
                                                  type: `Checkbox`,
                                                  appearance: `Default`,
                                                  align: `center`,
                                                  checkBoxProps: {
                                                    selection: ge,
                                                    accessibilityProps: {
                                                      "aria-label": `Select all templates on this page`,
                                                    },
                                                  },
                                                  onChange: pe,
                                                },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                TableCell,
                                                {
                                                  type: `Slot`,
                                                  appearance: `Default`,
                                                  align: `left`,
                                                  slots: (0,
                                                  import_jsx_runtime.jsx)(
                                                    `span`,
                                                    {
                                                      className: `cnh-list__th`,
                                                      children: `Notification name`,
                                                    },
                                                  ),
                                                },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                TableCell,
                                                {
                                                  type: `Slot`,
                                                  appearance: `Default`,
                                                  align: `left`,
                                                  slots: (0,
                                                  import_jsx_runtime.jsx)(
                                                    `span`,
                                                    {
                                                      className: `cnh-list__th`,
                                                      children: `Description`,
                                                    },
                                                  ),
                                                },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                TableCell,
                                                {
                                                  type: `Slot`,
                                                  appearance: `Default`,
                                                  align: `left`,
                                                  slots: (0,
                                                  import_jsx_runtime.jsx)(
                                                    `span`,
                                                    {
                                                      className: `cnh-list__th`,
                                                      children: `Product name`,
                                                    },
                                                  ),
                                                },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                TableCell,
                                                {
                                                  type: `Slot`,
                                                  appearance: `Default`,
                                                  align: `left`,
                                                  slots: (0,
                                                  import_jsx_runtime.jsx)(
                                                    `span`,
                                                    {
                                                      className: `cnh-list__th`,
                                                      children: `Service code`,
                                                    },
                                                  ),
                                                },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                TableCell,
                                                {
                                                  type: `Slot`,
                                                  appearance: `Default`,
                                                  align: `left`,
                                                  slots: (0,
                                                  import_jsx_runtime.jsx)(
                                                    `span`,
                                                    {
                                                      className: `cnh-list__th`,
                                                      children: `Channel`,
                                                    },
                                                  ),
                                                },
                                              ),
                                              (0, import_jsx_runtime.jsx)(
                                                TableCell,
                                                {
                                                  type: `Slot`,
                                                  appearance: `Default`,
                                                  align: `left`,
                                                  slots: (0,
                                                  import_jsx_runtime.jsx)(
                                                    `span`,
                                                    {
                                                      className: `cnh-list__th`,
                                                      children: `Status`,
                                                    },
                                                  ),
                                                },
                                              ),
                                            ],
                                          }),
                                        }),
                                        (0, import_jsx_runtime.jsx)(TableBody, {
                                          children: de.map((c) =>
                                            (0, import_jsx_runtime.jsxs)(
                                              TableRow,
                                              {
                                                heights: `64px`,
                                                showHover: !0,
                                                selected: G.has(c.id),
                                                hoverBackgroundColor: `var(--colorSurfaceSecondaryDefault)`,
                                                selectedBackgroundColor: `var(--colorSurfaceHighlightSubtleDefault)`,
                                                onClick: () => E?.(c),
                                                className: `cnh-list__row`,
                                                children: [
                                                  (0, import_jsx_runtime.jsx)(
                                                    TableCell,
                                                    {
                                                      type: `Checkbox`,
                                                      appearance: `Default`,
                                                      align: `center`,
                                                      checkBoxProps: {
                                                        selection: G.has(c.id)
                                                          ? `checked`
                                                          : `none`,
                                                        accessibilityProps: {
                                                          "aria-label": `Select ${c.name}`,
                                                        },
                                                      },
                                                      onClick: (c) =>
                                                        c.stopPropagation(),
                                                      onChange: () => fe(c.id),
                                                    },
                                                  ),
                                                  (0, import_jsx_runtime.jsx)(
                                                    TableCell,
                                                    {
                                                      type: `Text`,
                                                      appearance: `Default`,
                                                      align: `left`,
                                                      children: (0,
                                                      import_jsx_runtime.jsx)(
                                                        `span`,
                                                        {
                                                          className: `cnh-list__cell`,
                                                          children: c.name,
                                                        },
                                                      ),
                                                    },
                                                  ),
                                                  (0, import_jsx_runtime.jsx)(
                                                    TableCell,
                                                    {
                                                      type: `Text`,
                                                      appearance: `Default`,
                                                      align: `left`,
                                                      children: (0,
                                                      import_jsx_runtime.jsx)(
                                                        `span`,
                                                        {
                                                          className: `cnh-list__cell`,
                                                          children:
                                                            c.description,
                                                        },
                                                      ),
                                                    },
                                                  ),
                                                  (0, import_jsx_runtime.jsx)(
                                                    TableCell,
                                                    {
                                                      type: `Text`,
                                                      appearance: `Default`,
                                                      align: `left`,
                                                      children: (0,
                                                      import_jsx_runtime.jsx)(
                                                        `span`,
                                                        {
                                                          className: `cnh-list__cell`,
                                                          children:
                                                            c.productName ||
                                                            EMPTY$1,
                                                        },
                                                      ),
                                                    },
                                                  ),
                                                  (0, import_jsx_runtime.jsx)(
                                                    TableCell,
                                                    {
                                                      type: `Text`,
                                                      appearance: `Default`,
                                                      align: `left`,
                                                      children: (0,
                                                      import_jsx_runtime.jsx)(
                                                        `span`,
                                                        {
                                                          className: `cnh-list__cell`,
                                                          children:
                                                            c.serviceCode,
                                                        },
                                                      ),
                                                    },
                                                  ),
                                                  (0, import_jsx_runtime.jsx)(
                                                    TableCell,
                                                    {
                                                      type: `Text`,
                                                      appearance: `Default`,
                                                      align: `left`,
                                                      children: (0,
                                                      import_jsx_runtime.jsx)(
                                                        `span`,
                                                        {
                                                          className: `cnh-list__cell cnh-list__cell--wrap`,
                                                          children:
                                                            c.channels.join(
                                                              `, `,
                                                            ) || EMPTY$1,
                                                        },
                                                      ),
                                                    },
                                                  ),
                                                  (0, import_jsx_runtime.jsx)(
                                                    TableCell,
                                                    {
                                                      type: `Slot`,
                                                      appearance: `Default`,
                                                      align: `left`,
                                                      slots: (0,
                                                      import_jsx_runtime.jsxs)(
                                                        `div`,
                                                        {
                                                          className: `cnh-list__status`,
                                                          children: [
                                                            (0,
                                                            import_jsx_runtime.jsx)(
                                                              Badge,
                                                              {
                                                                label: c.status,
                                                                type: TONE$1[
                                                                  c.status
                                                                ],
                                                                size: `xs`,
                                                                showIcon: !1,
                                                              },
                                                            ),
                                                            (0,
                                                            import_jsx_runtime.jsx)(
                                                              `button`,
                                                              {
                                                                type: `button`,
                                                                "aria-label": `Download ${c.name}`,
                                                                className: `cnh-list__row-download`,
                                                                onClick: (
                                                                  l,
                                                                ) => {
                                                                  (l.stopPropagation(),
                                                                    J([c]));
                                                                },
                                                                children: (0,
                                                                import_jsx_runtime.jsx)(
                                                                  Icon,
                                                                  {
                                                                    slug: `download`,
                                                                    size: 16,
                                                                    color: `var(--colorIconHighlightDefault)`,
                                                                  },
                                                                ),
                                                              },
                                                            ),
                                                          ],
                                                        },
                                                      ),
                                                    },
                                                  ),
                                                ],
                                              },
                                              c.id,
                                            ),
                                          ),
                                        }),
                                      ],
                                    },
                                  ),
                                }),
                              ],
                            },
                          ),
                  }),
                  de.length > 0 &&
                    (0, import_jsx_runtime.jsx)(`div`, {
                      className: `cnh-list__pagination`,
                      children: (0, import_jsx_runtime.jsx)(TablePagination, {
                        count: ce.length,
                        rowsPerPage: 50,
                        page: ue,
                        hasRangeSelect: !1,
                        onPageChange: (c, l) => W(l),
                      }),
                    }),
                ],
              })),
    (0, import_jsx_runtime.jsxs)(`div`, {
      className: `cnh-list`,
      children: [
        (0, import_jsx_runtime.jsxs)(`div`, {
          className: `cnh-list__header`,
          children: [
            (0, import_jsx_runtime.jsx)(`h1`, {
              className: `cnh-list__title`,
              children: `Notification management`,
            }),
            (0, import_jsx_runtime.jsxs)(`div`, {
              className: `cnh-list__actions`,
              children: [
                (0, import_jsx_runtime.jsx)(OutlineButton$1, {
                  label: `Import`,
                  height: `44px`,
                  onClick: () => te(!0),
                }),
                (0, import_jsx_runtime.jsx)(Button, {
                  label: `Create notification`,
                  hasIcon: !0,
                  icon: (0, import_jsx_runtime.jsx)(Icon, {
                    slug: `plus`,
                    size: 16,
                    color: `currentColor`,
                  }),
                  onClick: T,
                }),
              ],
            }),
          ],
        }),
        (0, import_jsx_runtime.jsx)(`div`, {
          className: `cnh-list__body`,
          children: xe,
        }),
        (0, import_jsx_runtime.jsx)(DialogPopup, {
          open: q !== null,
          title: `Download the selected items?`,
          width: `600px`,
          className: `cnh-list__dialog`,
          titlePadding: `16px 16px 0`,
          contentPadding: `16px`,
          actionsPadding: `8px 16px 16px`,
          onClose: () => J(null),
          actions: [
            { label: `Cancel`, variant: `outline`, onClick: () => J(null) },
            {
              label: `Download`,
              variant: `filled`,
              onClick: () => {
                let c = q ?? [],
                  l = c.some((c) => c.status === `Inactive`);
                if ((J(null), oe(), l)) {
                  Z(!0);
                  return;
                }
                let _ = new Blob([toJsonl(c.map(toExport))], {
                    type: `application/jsonl`,
                  }),
                  T = URL.createObjectURL(_),
                  E = document.createElement(`a`);
                ((E.href = T),
                  (E.download =
                    c.length === 1
                      ? `${c[0].detail.templateRefCode}${FILE_EXT}`
                      : `templates${FILE_EXT}`),
                  document.body.appendChild(E),
                  E.click(),
                  E.remove(),
                  URL.revokeObjectURL(T),
                  $(!0));
              },
            },
          ],
          children: (0, import_jsx_runtime.jsx)(`span`, {
            className: `cnh-list__dialog-body`,
            children: `Each selected item will be saved as a separate JSON file`,
          }),
        }),
        (0, import_jsx_runtime.jsx)(Toast, {
          open: D !== null,
          appearance: `positive`,
          title: D ? NOTICES[D].title : ``,
          hasLeftIcon: !0,
          hasDescription: !0,
          description: D ? NOTICES[D].description : ``,
          hasCloseButton: !0,
          position: { vertical: `top`, horizontal: `right` },
          onClose: () => O?.(),
        }),
        (0, import_jsx_runtime.jsx)(Toast, {
          open: Q,
          appearance: `positive`,
          title: `Download Success`,
          hasLeftIcon: !0,
          hasDescription: !0,
          description: `Please try again`,
          hasCloseButton: !0,
          position: { vertical: `top`, horizontal: `right` },
          onClose: () => $(!1),
        }),
        (0, import_jsx_runtime.jsx)(ImportDialog, {
          open: ee,
          preset: N === `success` ? void 0 : N,
          onClose: () => te(!1),
          onImported: (c) => {
            (te(!1), W(0), oe(), M?.(c), re(c.length));
          },
        }),
        (0, import_jsx_runtime.jsx)(Toast, {
          open: ne !== null,
          appearance: `positive`,
          title: IMPORT_COPY.successTitle,
          hasLeftIcon: !0,
          hasDescription: !0,
          description: ne === null ? `` : IMPORT_COPY.successBody(ne),
          hasCloseButton: !0,
          autoHideDuration: N === `success` ? null : 3e3,
          position: { vertical: `top`, horizontal: `right` },
          onClose: () => re(null),
        }),
        (0, import_jsx_runtime.jsx)(Toast, {
          open: X,
          appearance: `negative`,
          title: `Unable to download`,
          hasLeftIcon: !0,
          hasDescription: !0,
          description: `Please try again`,
          hasCloseButton: !0,
          position: { vertical: `top`, horizontal: `right` },
          onClose: () => Z(!1),
        }),
      ],
    })
  );
}
function FilterSelect({ label: c, options: l, value: _, onChange: T }) {
  let E =
      _.length === l.length || _.length === 0
        ? `All`
        : l.filter((c) => _.includes(c)).join(`, `),
    D = (c) => T(_.includes(c) ? _.filter((l) => l !== c) : [..._, c]),
    O = _.length === l.length,
    A = _.length === 0;
  return (0, import_jsx_runtime.jsx)(`div`, {
    className: `cnh-list__filter-field`,
    children: (0, import_jsx_runtime.jsxs)(Select, {
      label: c,
      multiple: !0,
      isSlot: !0,
      options: [],
      value: _,
      onChange: () => void 0,
      renderValue: () => E,
      MenuProps: {
        classes: { paper: `cnh-list__panel` },
        anchorOrigin: { vertical: `bottom`, horizontal: `left` },
        transformOrigin: { vertical: `top`, horizontal: `left` },
      },
      children: [
        l.map((c) =>
          (0, import_jsx_runtime.jsxs)(
            MenuItem,
            {
              value: c,
              className: `cnh-list__option`,
              onClick: (l) => {
                (l.preventDefault(), D(c));
              },
              children: [
                (0, import_jsx_runtime.jsx)(Checkbox, {
                  selection: _.includes(c) ? `checked` : `none`,
                }),
                (0, import_jsx_runtime.jsx)(`span`, {
                  className: `cnh-list__option-label`,
                  children: c,
                }),
              ],
            },
            c,
          ),
        ),
        (0, import_jsx_runtime.jsx)(Divider, {
          className: `cnh-list__panel-rule`,
        }),
        (0, import_jsx_runtime.jsxs)(`div`, {
          className: `cnh-list__panel-foot`,
          children: [
            (0, import_jsx_runtime.jsx)(GhostButton, {
              label: `Select all`,
              appearance: `highlight`,
              padding: `none`,
              disabled: O,
              onClick: () => T([...l]),
            }),
            (0, import_jsx_runtime.jsx)(GhostButton, {
              label: `Clear`,
              appearance: `highlight`,
              padding: `none`,
              hasRightIcon: !0,
              icon: (0, import_jsx_runtime.jsx)(Icon, {
                slug: `close-circle`,
                size: 16,
                color: `currentColor`,
              }),
              disabled: A,
              onClick: () => T([]),
            }),
          ],
        }),
      ],
    }),
  });
}
var FORM = [
    {
      id: `general`,
      title: `General information`,
      toggle: !1,
      rows: [
        [
          {
            key: `templateName`,
            label: `Notification name`,
            required: !0,
            kind: `text`,
            hasHint: !1,
            max: 20,
            span: `half`,
            placeholder: `Enter notification name`,
          },
          {
            key: `templateDescription`,
            label: `Description`,
            required: !0,
            kind: `text`,
            hasHint: !1,
            max: 20,
            span: `half`,
            placeholder: `Enter description`,
          },
        ],
        [
          {
            key: `productName`,
            label: `Product name`,
            required: !1,
            kind: `text`,
            max: 50,
            span: `third`,
            placeholder: `Enter product name (optional)`,
            editWidth: 500,
          },
          {
            key: `serviceCode`,
            label: `Service code`,
            required: !0,
            kind: `multiselect`,
            options: SERVICE_CODE_LOV,
            span: `third`,
            placeholder: `Select service code`,
            editWidth: 220,
          },
          {
            key: `notificationGroup`,
            label: `Notification group`,
            required: !0,
            kind: `select`,
            options: NOTIFICATION_GROUP_LOV,
            span: `third`,
            placeholder: `Select notification group`,
            editWidth: 220,
          },
        ],
        [
          {
            key: `status`,
            label: `Status`,
            required: !0,
            kind: `select`,
            options: STATUSES,
            editOnly: !0,
            span: `third`,
            placeholder: `Select status`,
            editWidth: 220,
          },
        ],
        [
          {
            key: `remark`,
            label: `Remarks`,
            required: !1,
            kind: `textarea`,
            hasHint: !1,
            max: 500,
            span: `full`,
            placeholder: `Enter remarks (optional)`,
          },
        ],
      ],
    },
    {
      id: `push`,
      title: `Push notification`,
      toggle: !0,
      rowGap: 4,
      rows: [
        [
          {
            key: `pushTitleTh`,
            label: `Push title (TH)`,
            required: !0,
            kind: `text`,
            max: 255,
            span: `half`,
            placeholder: `Enter push title in Thai`,
          },
          {
            key: `pushTitleEn`,
            label: `Push title (EN)`,
            required: !0,
            kind: `text`,
            max: 255,
            span: `half`,
            placeholder: `Enter push title in English`,
          },
        ],
        [
          {
            key: `pushBodyTh`,
            label: `Push message (TH)`,
            required: !0,
            kind: `text`,
            max: 2048,
            boxHeight: 77,
            span: `half`,
            placeholder: `Enter push message in Thai`,
          },
          {
            key: `pushBodyEn`,
            label: `Push message (EN)`,
            required: !0,
            kind: `text`,
            max: 2048,
            boxHeight: 77,
            span: `half`,
            placeholder: `Enter push message in English`,
          },
        ],
        [
          {
            key: `pushDeeplink`,
            label: `Deep link`,
            required: !0,
            kind: `textarea`,
            max: 2048,
            rawFormat: !0,
            hint: `A deep link will take customers to your specific destination when tapping the push notification`,
            span: `full`,
            placeholder: `Enter a deep link URL (optional)`,
          },
        ],
      ],
    },
    {
      id: `email`,
      title: `Email`,
      toggle: !0,
      hint: `To send both Thai and English content in the same email, please enter content in both Thai and English for every placeholder`,
      rows: [
        [
          {
            key: `emailSubjectTh`,
            label: `Email subject (TH)`,
            required: !0,
            kind: `text`,
            max: 255,
            span: `half`,
            placeholder: `Enter email subject`,
          },
          {
            key: `emailSubjectEn`,
            label: `Email subject (EN)`,
            required: !0,
            kind: `text`,
            max: 255,
            span: `half`,
            placeholder: `Enter email subject`,
          },
        ],
        [
          {
            key: `emailBodyTh`,
            label: `Email content (TH)`,
            required: !0,
            kind: `textarea`,
            max: 2048,
            hasHint: !1,
            span: `half`,
            placeholder: `Enter email content`,
          },
          {
            key: `emailBodyEn`,
            label: `Email content (EN)`,
            required: !0,
            kind: `textarea`,
            max: 2048,
            hasHint: !1,
            span: `half`,
            placeholder: `Enter email content`,
          },
        ],
        [
          {
            key: `emailDisplayNameTh`,
            label: `Sender name (TH)`,
            required: !1,
            kind: `text`,
            max: 255,
            boxHeight: 77,
            span: `half`,
            placeholder: `Enter sender name in Thai (optional)`,
          },
          {
            key: `emailDisplayNameEn`,
            label: `Sender name (EN)`,
            required: !0,
            kind: `text`,
            max: 255,
            boxHeight: 77,
            span: `half`,
            placeholder: `Enter sender name in English`,
          },
        ],
        [
          {
            key: `emailFromAddress`,
            label: `Sender email address`,
            required: !1,
            kind: `text`,
            max: 255,
            rawFormat: !0,
            placeholder: `Enter sender email address (optional)`,
            span: `half`,
          },
          {
            key: `emailTemplateName`,
            label: `Notification name`,
            required: !0,
            kind: `text`,
            max: 20,
            span: `half`,
            placeholder: `Enter notification name`,
          },
        ],
      ],
    },
    {
      id: `sms`,
      title: `SMS`,
      toggle: !0,
      rows: [
        [
          {
            key: `smsMessageTh`,
            label: `SMS message (TH)`,
            required: !0,
            kind: `textarea`,
            max: 800,
            span: `half`,
            placeholder: `Enter SMS message in Thai`,
          },
          {
            key: `smsMessageEn`,
            label: `SMS message (EN)`,
            required: !0,
            kind: `textarea`,
            max: 800,
            span: `half`,
            placeholder: `Enter SMS message in English`,
          },
        ],
      ],
    },
  ],
  STEP_1_TITLE = `Step 1: Enter general information about the notification`,
  STEP_2_TITLE = `Step 2: Enable the notification channels you want to use and enter the required information`,
  MSG_REQUIRED = `Please enter information`,
  MSG_NO_CHANNEL = `Please enable at least 1 notification channel`,
  msgMax = (c) => `Character limit exceeded`,
  MSG_CHARSET = `You can use these special characters only ~ ฿ ^ _ : . / ?`,
  ALLOWED = /^[฀-๿ a-zA-Z0-9~฿^_:./?\n\r]*$/,
  FORBIDDEN = [/<#[^>]*>/, /<@[^>]*>/, /\[=[^\]]*\]/, /\[#[^\]]*\]/],
  patternsOk = (c) => !FORBIDDEN.some((l) => l.test(c)),
  charsetOk = (c, l = !1) => patternsOk(c) && (l || ALLOWED.test(c)),
  SECTION_OF = { general: `general`, push: `push`, email: `email`, sms: `sms` };
function TemplateForm({
  mode: c,
  title: l,
  initialValues: _ = {},
  initialToggles: T = { push: !0, email: !0, sms: !0 },
  onSubmit: E,
  onSaveDraft: D,
  onUpdate: O,
  onBack: A,
  failNext: j,
  loading: M,
  onFail: N,
}) {
  let [F, I] = (0, import_react.useState)(_),
    [L, R] = (0, import_react.useState)(T),
    [z, B] = (0, import_react.useState)({}),
    [V, H] = (0, import_react.useState)(!1),
    [U, W] = (0, import_react.useState)(!1),
    [G, K] = (0, import_react.useState)(!1),
    [q, J] = (0, import_react.useState)(null),
    X = (0, import_react.useRef)(null);
  useUniqueSelectNames([c, M]);
  let Z = (0, import_react.useMemo)(
      () =>
        JSON.stringify(F) !== JSON.stringify(_) ||
        JSON.stringify(L) !== JSON.stringify(T),
      [F, L, _, T],
    ),
    Q = (c) => c.id === `general` || L[SECTION_OF[c.id]],
    $ = (c, l) => {
      I((_) => ({ ..._, [c]: l }));
      let _ = FORM.flatMap((c) => c.rows.flat()).find((l) => l.key === c),
        T = _?.kind === `text` || _?.kind === `textarea`,
        E = T && _?.max ? l.length > _.max : !1,
        D = T && !charsetOk(l, _?.rawFormat);
      B((l) => {
        let T = { ...l };
        return (
          E && D
            ? (T[c] = `${MSG_CHARSET}\n${msgMax(_.max)}`)
            : E
              ? (T[c] = msgMax(_.max))
              : D
                ? (T[c] = MSG_CHARSET)
                : delete T[c],
          T
        );
      });
    },
    ee = (l = !0) => {
      let T = {};
      for (let l of FORM)
        if (Q(l))
          for (let E of l.rows)
            for (let l of E) {
              if (l.editOnly && c === `create`) continue;
              let E = F[l.key] ?? ``,
                D = c === `edit` && E === (_[l.key] ?? ``),
                O = l.kind === `text` || l.kind === `textarea`,
                A = O && !!l.max && E.length > l.max && !D,
                j = O && !charsetOk(E, l.rawFormat);
              l.required && !E.trim()
                ? (T[l.key] = MSG_REQUIRED)
                : A && j
                  ? (T[l.key] = `${MSG_CHARSET}\n${msgMax(l.max)}`)
                  : j
                    ? (T[l.key] = MSG_CHARSET)
                    : A && (T[l.key] = msgMax(l.max));
            }
      let E = l && !L.push && !L.email && !L.sms;
      return (
        B(T),
        H(E),
        Object.keys(T).length || E
          ? (requestAnimationFrame(() => {
              X.current
                ?.querySelector(`[data-error="true"]`)
                ?.scrollIntoView({ block: `center`, behavior: `smooth` });
            }),
            !1)
          : !0
      );
    },
    te = (l) => {
      if (l === `draft`) {
        let l = FORM[0].rows
            .flat()
            .filter((l) => !(l.editOnly && c === `create`))
            .filter((c) => c.required && !(F[c.key] ?? ``).trim())
            .map((c) => c.key),
          _ = !L.push && !L.email && !L.sms;
        if (l.length || _) {
          (H(_), B(Object.fromEntries(l.map((c) => [c, MSG_REQUIRED]))), K(!0));
          return;
        }
        return j ? (J(`draft`), N?.()) : D?.(F, L);
      }
      if (ee(l !== `update` || F.status !== `Draft`)) {
        if (j) return (J(l), N?.());
        l === `update` ? O?.(F, L) : E?.(F, L);
      }
    };
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-form`,
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-form__header`,
        children: [
          (0, import_jsx_runtime.jsx)(`button`, {
            type: `button`,
            "aria-label": `Back`,
            onClick: () => (Z ? W(!0) : A()),
            className: `cnh-form__back`,
            children: (0, import_jsx_runtime.jsx)(Icon, {
              slug: `chevron-left`,
              size: 24,
            }),
          }),
          (0, import_jsx_runtime.jsx)(`h1`, {
            className: `cnh-form__title`,
            children: l,
          }),
        ],
      }),
      (0, import_jsx_runtime.jsx)(`div`, {
        ref: X,
        className: `cnh-form__scroll`,
        children: M
          ? (0, import_jsx_runtime.jsx)(`div`, {
              className: `cnh-form__loading`,
              children: (0, import_jsx_runtime.jsx)(SpinnerLoader, {
                size: `L`,
                appearance: `brand`,
              }),
            })
          : (0, import_jsx_runtime.jsx)(`div`, {
              className: `cnh-form__page`,
              children: (0, import_jsx_runtime.jsxs)(`div`, {
                className: `cnh-form__column`,
                children: [
                  (0, import_jsx_runtime.jsx)(Step, {
                    title: STEP_1_TITLE,
                    children: (0, import_jsx_runtime.jsx)(FormSection, {
                      section: FORM[0],
                      values: F,
                      errors: z,
                      onChange: $,
                      enabled: !0,
                      mode: c,
                    }),
                  }),
                  (0, import_jsx_runtime.jsx)(Step, {
                    title: STEP_2_TITLE,
                    alert: V
                      ? (0, import_jsx_runtime.jsx)(Alert, {
                          appearance: `negative`,
                          alertTitleLabel: MSG_NO_CHANNEL,
                          showLeadingIcon: !0,
                        })
                      : void 0,
                    children: (0, import_jsx_runtime.jsx)(`div`, {
                      className: `cnh-form__cards`,
                      "data-error": V ? `true` : void 0,
                      children: FORM.slice(1).map((l) =>
                        (0, import_jsx_runtime.jsx)(
                          FormSection,
                          {
                            mode: c,
                            section: l,
                            values: F,
                            errors: z,
                            onChange: $,
                            invalid: V,
                            enabled: L[SECTION_OF[l.id]],
                            onToggle: (c) => {
                              (R((_) => ({ ..._, [SECTION_OF[l.id]]: c })),
                                c ||
                                  B((c) => {
                                    let _ = { ...c };
                                    for (let c of l.rows.flat())
                                      delete _[c.key];
                                    return _;
                                  }));
                            },
                          },
                          l.id,
                        ),
                      ),
                    }),
                  }),
                ],
              }),
            }),
      }),
      (0, import_jsx_runtime.jsx)(`div`, {
        className: `cnh-form__footer`,
        children: (0, import_jsx_runtime.jsx)(`div`, {
          className: `cnh-form__footer-row`,
          children:
            c === `create`
              ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
                  children: [
                    (0, import_jsx_runtime.jsx)(OutlineButton$1, {
                      label: `Save as draft`,
                      width: `177px`,
                      disabled: M,
                      onClick: () => te(`draft`),
                    }),
                    (0, import_jsx_runtime.jsx)(Button, {
                      label: `Publish`,
                      width: `177px`,
                      disabled: M,
                      onClick: () => te(`submit`),
                    }),
                  ],
                })
              : (0, import_jsx_runtime.jsx)(Button, {
                  label: `Save`,
                  width: `177px`,
                  disabled: !Z || M,
                  onClick: () => te(`update`),
                }),
        }),
      }),
      (0, import_jsx_runtime.jsx)(DialogPopup, {
        open: U,
        title: `You are about to leave this page`,
        width: `600px`,
        className: `cnh-form__dialog cnh-form__dialog--body-m`,
        titlePadding: `16px 16px 0`,
        contentPadding: `16px`,
        actionsPadding: `8px 16px 16px`,
        onClose: () => W(!1),
        actions: [
          {
            label: `Leave`,
            variant: `outline`,
            onClick: () => {
              (W(!1), A());
            },
          },
          { label: `Stay`, variant: `filled`, onClick: () => W(!1) },
        ],
        children: `The changes you made will not be saved`,
      }),
      (0, import_jsx_runtime.jsx)(DialogPopup, {
        open: q !== null,
        title:
          q === `draft`
            ? `Unable to save the draft`
            : q === `update`
              ? `Unable to save your changes`
              : `Unable to publish the notification`,
        width: `600px`,
        className: `cnh-form__dialog cnh-form__dialog--body-l`,
        titlePadding: `16px 16px 0`,
        contentPadding: `16px`,
        actionsPadding: `8px 16px 16px`,
        onClose: () => J(null),
        actions: [
          { label: `Close`, variant: `outline`, onClick: () => J(null) },
          {
            label: `Try again`,
            variant: `filled`,
            onClick: () => {
              let c = q;
              (J(null),
                c &&
                  te(
                    c === `draft`
                      ? `draft`
                      : c === `update`
                        ? `update`
                        : `submit`,
                  ));
            },
          },
        ],
        children: `Please try again`,
      }),
      (0, import_jsx_runtime.jsx)(DialogPopup, {
        open: G,
        title: `Fill in all required General Info fields and at least 1 Channel to save as draft`,
        width: `600px`,
        className: `cnh-form__dialog`,
        titlePadding: `16px 16px 0`,
        contentPadding: `16px`,
        actionsPadding: `8px 16px 16px`,
        onClose: () => K(!1),
        actions: [{ label: `Ok`, variant: `filled`, onClick: () => K(!1) }],
      }),
    ],
  });
}
function Step({ title: c, alert: l, children: _ }) {
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-form__step`,
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-form__step-head`,
        children: [
          (0, import_jsx_runtime.jsx)(`h2`, {
            className: `cnh-form__step-title`,
            children: c,
          }),
          l,
        ],
      }),
      _,
    ],
  });
}
function FormSection({
  section: c,
  values: l,
  errors: _,
  onChange: T,
  enabled: E,
  onToggle: D,
  mode: O,
  invalid: A,
}) {
  let j = c.rows
    .map((c) => c.filter((c) => O === `edit` || !c.editOnly))
    .filter((c) => c.length > 0)
    .reduce((c, l) => {
      let _ = c[c.length - 1];
      return O === `edit` &&
        _ &&
        l.every((c) => c.editOnly) &&
        _.every((c) => c.editWidth)
        ? (_.push(...l), c)
        : (c.push([...l]), c);
    }, []);
  return (0, import_jsx_runtime.jsxs)(CardSurface, {
    type: `default`,
    tabIndex: -1,
    width: `100%`,
    padding: `var(--floatGenericSpace6)`,
    borderRadius: `var(--floatRadius2)`,
    backgroundColor: `var(--colorSurfacePrimaryDefault)`,
    className: A ? `cnh-form__card cnh-form__card--invalid` : `cnh-form__card`,
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: c.toggle
          ? `cnh-form__card-head`
          : `cnh-form__card-head cnh-form__card-head--text`,
        children: [
          c.toggle &&
            (0, import_jsx_runtime.jsx)(ToggleSwitch, {
              isToggled: E,
              onToggle: (c) => D?.(c),
              ariaLabel: c.title,
            }),
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `cnh-form__card-text`,
            children: [
              (0, import_jsx_runtime.jsx)(`span`, {
                className: `cnh-form__card-title`,
                children: c.title,
              }),
              c.hint &&
                (0, import_jsx_runtime.jsx)(`span`, {
                  className: `cnh-form__card-hint`,
                  children: c.hint,
                }),
            ],
          }),
        ],
      }),
      (0, import_jsx_runtime.jsx)(`div`, {
        className: c.rowGap === 4 ? `cnh-form__rows--16` : `cnh-form__rows--24`,
        children: j.map((c, D) =>
          (0, import_jsx_runtime.jsx)(
            `div`,
            {
              className: `cnh-form__row`,
              children: c.map((c) =>
                (0, import_jsx_runtime.jsx)(
                  `div`,
                  {
                    className: `cnh-form__span cnh-form__span--${c.span}`,
                    style:
                      O === `edit` && c.editWidth
                        ? { width: c.editWidth, flexGrow: 0 }
                        : void 0,
                    "data-error": _[c.key] ? `true` : void 0,
                    children: (0, import_jsx_runtime.jsx)(Field, {
                      spec: c,
                      value: l[c.key] ?? ``,
                      error: _[c.key],
                      disabled: !E,
                      onChange: (l) => T(c.key, l),
                    }),
                  },
                  c.key,
                ),
              ),
            },
            D,
          ),
        ),
      }),
    ],
  });
}
function Field({ spec: c, value: l, error: _, disabled: T, onChange: E }) {
  let D = c.label,
    O = (0, import_react.useRef)(null),
    A = `${c.key}-message`;
  (0, import_react.useEffect)(() => {
    let l = O.current?.querySelector(`input, textarea`);
    if (l) {
      if (
        ((l.id ||= c.key),
        c.required
          ? l.setAttribute(`aria-required`, `true`)
          : l.removeAttribute(`aria-required`),
        _)
      ) {
        l.setAttribute(`aria-invalid`, `true`);
        let c = O.current?.querySelector(`.inline-message`);
        (c && (c.id = A), l.setAttribute(`aria-describedby`, A));
      } else
        (l.removeAttribute(`aria-invalid`),
          l.removeAttribute(`aria-describedby`));
    }
  }, [c.key, c.required, _, A]);
  let j = _
      ? _.split(`
`)
      : void 0,
    M = !!(c.max && c.hasHint !== !1),
    N = M
      ? (0, import_jsx_runtime.jsxs)(`div`, {
          className: `cnh-form__counter`,
          children: [
            _
              ? (0, import_jsx_runtime.jsx)(InlineMessage, {
                  text: j,
                  bulleted: j.length > 1,
                  appearance: `negative`,
                  size: `xs`,
                })
              : (0, import_jsx_runtime.jsx)(`span`, {
                  className: `cnh-form__hint`,
                  children: c.hint ?? ``,
                }),
            (0, import_jsx_runtime.jsxs)(`span`, {
              children: [l.length, `/`, c.max],
            }),
          ],
        })
      : null,
    F = c.boxHeight ? { "--cnh-box-h": `${c.boxHeight}px` } : void 0;
  if (c.kind === `multiselect`) {
    let O = c.options ?? [],
      A = l ? l.split(`, `) : [],
      j = (c) =>
        E(
          (A.includes(c)
            ? A.filter((l) => l !== c)
            : O.filter((l) => A.includes(l) || l === c)
          ).join(`, `),
        );
    return (0, import_jsx_runtime.jsxs)(`div`, {
      className: `cnh-form__field`,
      children: [
        (0, import_jsx_runtime.jsxs)(Select, {
          label: D,
          labelPosition: `outside`,
          isRequired: c.required,
          multiple: !0,
          isSlot: !0,
          options: [],
          disabled: T,
          error: !!_,
          hasHint: !!_,
          hint: _,
          value: A,
          onChange: () => void 0,
          renderValue: () => A.join(`, `),
          MenuProps: { classes: { paper: `cnh-form__panel` } },
          children: [
            O.map((c) =>
              (0, import_jsx_runtime.jsxs)(
                MenuItem,
                {
                  value: c,
                  className: `cnh-form__option`,
                  onClick: (l) => {
                    (l.preventDefault(), j(c));
                  },
                  children: [
                    (0, import_jsx_runtime.jsx)(Checkbox, {
                      selection: A.includes(c) ? `checked` : `none`,
                    }),
                    (0, import_jsx_runtime.jsx)(`span`, {
                      className: `cnh-form__option-label`,
                      children: c,
                    }),
                  ],
                },
                c,
              ),
            ),
            (0, import_jsx_runtime.jsx)(Divider, {
              className: `cnh-form__panel-rule`,
            }),
            (0, import_jsx_runtime.jsxs)(`div`, {
              className: `cnh-form__panel-foot`,
              children: [
                (0, import_jsx_runtime.jsx)(GhostButton, {
                  label: `Select all`,
                  appearance: `highlight`,
                  padding: `none`,
                  disabled: A.length === O.length,
                  onClick: () => E(O.join(`, `)),
                }),
                (0, import_jsx_runtime.jsx)(GhostButton, {
                  label: `Clear`,
                  appearance: `highlight`,
                  padding: `none`,
                  hasRightIcon: !0,
                  icon: (0, import_jsx_runtime.jsx)(Icon, {
                    slug: `close-circle`,
                    size: 16,
                    color: `currentColor`,
                  }),
                  disabled: A.length === 0,
                  onClick: () => E(``),
                }),
              ],
            }),
          ],
        }),
        !l &&
          c.placeholder &&
          (0, import_jsx_runtime.jsx)(`span`, {
            className: `cnh-form__select-placeholder`,
            children: c.placeholder,
          }),
      ],
    });
  }
  if (c.kind === `select`) {
    let O = (c.options ?? []).map((c) => ({ value: c, label: c }));
    return (0, import_jsx_runtime.jsxs)(`div`, {
      className: `cnh-form__field`,
      children: [
        (0, import_jsx_runtime.jsx)(Select, {
          label: D,
          labelPosition: `outside`,
          isRequired: c.required,
          options: O,
          multiple: !1,
          MenuProps: {
            classes: { paper: `cnh-form__menu` },
            anchorOrigin: { vertical: `bottom`, horizontal: `left` },
            transformOrigin: { vertical: `top`, horizontal: `left` },
          },
          disabled: T,
          error: !!_,
          hasHint: !!_,
          hint: _,
          value: l,
          onChange: (c) => E(c),
        }),
        !l &&
          c.placeholder &&
          (0, import_jsx_runtime.jsx)(`span`, {
            className: `cnh-form__select-placeholder`,
            children: c.placeholder,
          }),
      ],
    });
  }
  return c.kind === `textarea` || c.boxHeight
    ? (0, import_jsx_runtime.jsxs)(`div`, {
        ref: O,
        className: `cnh-form__field`,
        children: [
          (0, import_jsx_runtime.jsx)(TextArea, {
            id: c.key,
            name: c.key,
            "aria-label": D,
            label: c.required ? `${D}*` : D,
            value: l,
            placeholder: c.placeholder,
            disabled: T,
            error: !!_,
            hasMessage: !!_ && !M && j.length === 1,
            message: M ? void 0 : _,
            messageVariant: `negative`,
            hasCounter: !1,
            hasHint: !1,
            height: `${c.boxHeight ?? 156}px`,
            width: `100%`,
            onChange: E,
          }),
          _ &&
            !M &&
            j.length > 1 &&
            (0, import_jsx_runtime.jsx)(`div`, {
              className: `cnh-form__textarea-message`,
              children: (0, import_jsx_runtime.jsx)(InlineMessage, {
                text: j,
                bulleted: !0,
                appearance: `negative`,
                size: `xs`,
              }),
            }),
          N,
        ],
      })
    : (0, import_jsx_runtime.jsxs)(`div`, {
        ref: O,
        className: `cnh-form__field`,
        style: F,
        children: [
          (0, import_jsx_runtime.jsx)(TextField, {
            id: c.key,
            name: c.key,
            label: D,
            labelPosition: `outside`,
            required: c.required,
            value: l,
            placeholder: c.placeholder,
            disabled: T,
            error: !!_,
            hasMessage: !!_ && !M,
            messageText: M ? void 0 : j,
            messageBulleted: (j?.length ?? 0) > 1,
            messageSize: `xs`,
            messageVariant: `negative`,
            hasCounter: !1,
            onChange: E,
          }),
          N,
        ],
      });
}
var TONE = { Published: `positive`, Inactive: `disabled`, Draft: `caution` };
function TemplateDrawer({ template: c, onClose: l, onEdit: _, onDownload: T }) {
  let E = (0, import_react.useRef)(null),
    D = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    let c = document.activeElement;
    E.current?.focus();
    let _ = (c) => {
        if (c.key === `Escape`) return l();
        if (c.key !== `Tab` || !E.current) return;
        let _ = [
          ...E.current.querySelectorAll(
            `button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])`,
          ),
        ].filter((c) => c.offsetParent !== null);
        if (!_.length) return;
        let T = _[0],
          D = _[_.length - 1],
          O = document.activeElement;
        c.shiftKey && (O === T || O === E.current)
          ? (c.preventDefault(), D.focus())
          : !c.shiftKey && O === D && (c.preventDefault(), T.focus());
      },
      T = (c) => {
        E.current?.contains(c.target) || l();
      },
      D = setTimeout(() => document.addEventListener(`mousedown`, T), 0);
    return (
      addEventListener(`keydown`, _),
      () => {
        (clearTimeout(D),
          document.removeEventListener(`mousedown`, T),
          removeEventListener(`keydown`, _),
          c && document.contains(c) && c.focus());
      }
    );
  }, [l]);
  let O = c.detail,
    A = [
      {
        title: `General information`,
        icon: `personal-information`,
        rows: [
          [`Ref code`, O.templateRefCode],
          [`Notification name`, c.name],
          [`Description`, c.description],
          [`Product name`, c.productName],
          [`Service code`, O.serviceCode],
          [`Notification group`, O.notificationGroup],
          [`Remarks`, O.remark],
        ],
      },
      {
        title: `Push notification`,
        icon: `alert`,
        rows: [
          [`Push title (TH)`, O.pushTitleTh],
          [`Push title (EN)`, O.pushTitleEn],
          [`Push message (TH)`, O.pushBodyTh],
          [`Push message (EN)`, O.pushBodyEn],
          [`Deep link`, O.pushDeeplink],
        ],
      },
      {
        title: `Email`,
        icon: `mail`,
        rows: [
          [`Email subject (TH)`, O.emailSubjectTh],
          [`Email subject (EN)`, O.emailSubjectEn],
          [`Email content (TH)`, O.emailBodyTh],
          [`Email content (EN)`, O.emailBodyEn],
          [`Sender name (TH)`, O.emailDisplayNameTh],
          [`Sender name (EN)`, O.emailDisplayNameEn],
          [`Sender email address`, O.emailFromAddress],
        ],
      },
      {
        title: `SMS`,
        icon: `message`,
        rows: [
          [`Email subject (TH)`, O.smsMessageTh],
          [`Email subject (EN)`, O.smsMessageEn],
        ],
      },
    ];
  return (0, import_jsx_runtime.jsxs)(`aside`, {
    ref: E,
    className: `tpl-drawer`,
    role: `dialog`,
    "aria-modal": `true`,
    "aria-label": c.name,
    tabIndex: -1,
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `tpl-drawer__header`,
        children: [
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `tpl-drawer__header-top`,
            children: [
              (0, import_jsx_runtime.jsxs)(`div`, {
                className: `tpl-drawer__titles`,
                children: [
                  (0, import_jsx_runtime.jsx)(`span`, {
                    className: `tpl-drawer__title`,
                    children: c.name,
                  }),
                  (0, import_jsx_runtime.jsxs)(`div`, {
                    className: `tpl-drawer__status`,
                    children: [
                      (0, import_jsx_runtime.jsx)(`span`, {
                        className: `tpl-drawer__status-label`,
                        children: `Status`,
                      }),
                      (0, import_jsx_runtime.jsx)(Badge, {
                        label: c.status,
                        type: TONE[c.status],
                        size: `xs`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, import_jsx_runtime.jsx)(`button`, {
                type: `button`,
                "aria-label": `Close`,
                onClick: l,
                className: `tpl-drawer__close`,
                children: (0, import_jsx_runtime.jsx)(Icon, {
                  slug: `sidebar-collapse`,
                  size: 24,
                }),
              }),
            ],
          }),
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `tpl-drawer__meta`,
            children: [
              (0, import_jsx_runtime.jsx)(Meta$1, {
                icon: `user`,
                label: `Created by: ${O.createdBy}`,
              }),
              (0, import_jsx_runtime.jsx)(Meta$1, {
                icon: `edit-1`,
                label: `Updated by: ${O.updatedBy}`,
              }),
              (0, import_jsx_runtime.jsx)(Meta$1, {
                icon: `transaction-history`,
                label: `Last update: ${O.lastUpdated}`,
              }),
            ],
          }),
        ],
      }),
      (0, import_jsx_runtime.jsx)(ScrollBar, {
        appearance: `thick`,
        orientation: `vertical`,
        width: `100%`,
        height: `100%`,
        className: `tpl-drawer__body-wrap`,
        children: (0, import_jsx_runtime.jsx)(`div`, {
          ref: D,
          className: `tpl-drawer__body`,
          children: A.map((c, l) =>
            (0, import_jsx_runtime.jsxs)(
              `div`,
              {
                className: `tpl-drawer__section`,
                children: [
                  (0, import_jsx_runtime.jsx)(Divider, {
                    className: l === 0 ? `tpl-drawer__divider--blank` : void 0,
                  }),
                  (0, import_jsx_runtime.jsxs)(`div`, {
                    className: `tpl-drawer__section-head`,
                    children: [
                      (0, import_jsx_runtime.jsx)(Icon, {
                        slug: c.icon,
                        size: 24,
                      }),
                      (0, import_jsx_runtime.jsx)(`span`, {
                        className: `tpl-drawer__section-title`,
                        children: c.title,
                      }),
                    ],
                  }),
                  (0, import_jsx_runtime.jsx)(`div`, {
                    className: `tpl-drawer__rows`,
                    children: c.rows.map(([c, l]) =>
                      (0, import_jsx_runtime.jsxs)(
                        `div`,
                        {
                          className: `tpl-drawer__row`,
                          children: [
                            (0, import_jsx_runtime.jsx)(`span`, {
                              className: `tpl-drawer__row-label`,
                              children: c,
                            }),
                            (0, import_jsx_runtime.jsx)(`span`, {
                              className: `tpl-drawer__row-value`,
                              children: l || `–`,
                            }),
                          ],
                        },
                        c,
                      ),
                    ),
                  }),
                ],
              },
              c.title,
            ),
          ),
        }),
      }),
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `tpl-drawer__footer`,
        children: [
          (0, import_jsx_runtime.jsx)(OutlineButton$1, {
            label: `Download`,
            hasIcon: !0,
            icon: (0, import_jsx_runtime.jsx)(Icon, {
              slug: `download`,
              size: 16,
              color: `currentColor`,
            }),
            height: `44px`,
            onClick: T,
          }),
          (0, import_jsx_runtime.jsx)(Button, {
            label: `Edit`,
            appearance: `default`,
            height: `44px`,
            onClick: _,
          }),
        ],
      }),
    ],
  });
}
function Meta$1({ icon: c, label: l }) {
  return (0, import_jsx_runtime.jsxs)(`span`, {
    className: `tpl-drawer__meta-item`,
    children: [
      (0, import_jsx_runtime.jsx)(Icon, {
        slug: c,
        size: 16,
        color: `var(--colorIconTertiaryDefault)`,
      }),
      (0, import_jsx_runtime.jsx)(`span`, { children: l }),
    ],
  });
}
function Login({ onSignIn: c }) {
  return (0, import_jsx_runtime.jsx)(`div`, {
    className: `login`,
    children: (0, import_jsx_runtime.jsxs)(`div`, {
      className: `login__row`,
      children: [
        (0, import_jsx_runtime.jsx)(`div`, {
          className: `login__banner`,
          children: (0, import_jsx_runtime.jsx)(`img`, {
            src: `/img/login-banner.png`,
            alt: ``,
            width: 534,
            height: 713,
          }),
        }),
        (0, import_jsx_runtime.jsxs)(`div`, {
          className: `login__contents`,
          children: [
            (0, import_jsx_runtime.jsx)(`img`, {
              src: `/bbl-logo.svg`,
              alt: `Bangkok Bank`,
              width: 250,
              height: 62,
            }),
            (0, import_jsx_runtime.jsxs)(`div`, {
              className: `login__block`,
              children: [
                (0, import_jsx_runtime.jsx)(`p`, {
                  className: `login__welcome`,
                  children: `Welcome to`,
                }),
                (0, import_jsx_runtime.jsx)(`h1`, {
                  className: `login__title`,
                  children: `Customer Notification Hub (CNH)`,
                }),
                (0, import_jsx_runtime.jsx)(`p`, {
                  className: `login__contact`,
                  children: `For login assistance, please contact the Service Desk at 02-031-0888`,
                }),
                (0, import_jsx_runtime.jsx)(Button, {
                  label: `Log in`,
                  appearance: `default`,
                  width: `285px`,
                  height: `44px`,
                  onClick: c,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
var BROADCAST_COPY = {
    listTitle: `Broadcast message`,
    create: `Create broadcast`,
    edit: `Edit broadcast`,
    createLede: `Create a manual notification for a selected audience.`,
    emptyTitle: `No broadcasts created yet`,
    emptyLine: `Create a broadcast to send one message to many customers`,
    dropTitle: `Upload audience file`,
    dropHint: `Supported file types: CSV, XLSX · Maximum 10 MB · Up to 1,000 recipients`,
    browse: `Choose file`,
    sample: `Download sample file`,
    noFile: `Upload an audience file to continue`,
    noValidRows: `The file has no valid recipients. Fix the file and upload it again`,
    fileSize: `The file is larger than 10 MB`,
    fileFormat: `Invalid file format. Only .csv and .xlsx files can be uploaded`,
    xlsxNotInPrototype: `This prototype can only read .csv. Save the sheet as .csv and upload it again`,
    fileEmpty: `The file has no recipients`,
    tooManyRows: (c) =>
      `The file has ${c.toLocaleString(`en-US`)} recipients. The maximum is 1,000`,
    checking: `Checking file…`,
    validated: `File validated`,
    rowsSummary: (c, l) =>
      `${c.toLocaleString(`en-US`)} ${c === 1 ? `recipient` : `recipients`} · ${l.toLocaleString(`en-US`)} valid`,
    invalidCount: (c) => `${c} invalid`,
    invalidNote: `Invalid recipients are skipped. Only valid recipients will receive the broadcast.`,
    previewTitle: `Preview (first 5 rows)`,
    required: `This field is required`,
    noColumn: `Select the column that identifies each recipient`,
    noChannel: `Please enable at least 1 notification channel`,
    noDirectChannel: `Select Email or SMS`,
    msgMax: (c) => `Maximum ${c} characters allowed.`,
    pickField: `Click in a message field first, then choose a field to insert`,
    startPast: `Start must be later than the current time`,
    dndNoDay: `Select at least 1 day`,
    dndSame: `The quiet period cannot start and end at the same time`,
    submitTitle: `Submit this broadcast?`,
    submitFailTitle: `Unable to submit the broadcast`,
    createdTitle: `Broadcast submitted`,
    createdBody: (c) => `${c} will be sent outside the quiet period`,
    draftTitle: `Draft saved`,
    draftBody: (c) => `${c} is saved as a draft`,
    draftNeedsName: `Enter a broadcast name to save a draft`,
  },
  MAX_FILE_BYTES = 10485760,
  MAX_RECIPIENTS = 1e3,
  MOBILE = /^\+?\d{9,15}$/,
  EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function parseCsv(c) {
  let l = [],
    _ = [],
    T = ``,
    E = !1,
    D = c.replace(/^﻿/, ``);
  for (let c = 0; c < D.length; c++) {
    let O = D[c];
    E
      ? O === `"` && D[c + 1] === `"`
        ? ((T += `"`), c++)
        : O === `"`
          ? (E = !1)
          : (T += O)
      : O === `"`
        ? (E = !0)
        : O === `,`
          ? (_.push(T), (T = ``))
          : O ===
                `
` || O === `\r`
            ? (O === `\r` &&
                D[c + 1] ===
                  `
` &&
                c++,
              _.push(T),
              l.push(_),
              (_ = []),
              (T = ``))
            : (T += O);
  }
  return (
    (T !== `` || _.length) && (_.push(T), l.push(_)),
    l.filter((c) => c.some((c) => c.trim() !== ``))
  );
}
function readAudience(c, l, _ = l.length) {
  let T = c.toLowerCase();
  if (!T.endsWith(`.csv`) && !T.endsWith(`.xlsx`))
    return { ok: !1, message: BROADCAST_COPY.fileFormat };
  if (_ > 10485760) return { ok: !1, message: BROADCAST_COPY.fileSize };
  if (T.endsWith(`.xlsx`))
    return { ok: !1, message: BROADCAST_COPY.xlsxNotInPrototype };
  let E = parseCsv(l),
    D = E.slice(1);
  return E.length === 0 || D.length === 0
    ? { ok: !1, message: BROADCAST_COPY.fileEmpty }
    : D.length > 1e3
      ? { ok: !1, message: BROADCAST_COPY.tooManyRows(D.length) }
      : { ok: !0, audience: { headers: E[0].map((c) => c.trim()), rows: D } };
}
async function readAudienceFile(c) {
  return c.name.toLowerCase().endsWith(`.csv`)
    ? readAudience(c.name, await c.text(), c.size)
    : readAudience(c.name, ``, c.size);
}
var idKind = (c, l) =>
    c === `cis`
      ? `cis`
      : l.includes(`SMS`)
        ? `mobile`
        : l.includes(`Email`)
          ? `email`
          : null,
  ID_LABEL = { cis: `CIS ID`, mobile: `Mobile number`, email: `Email address` },
  GUESS = { cis: /cis/i, mobile: /mobile|phone|tel/i, email: /e-?mail/i },
  guessColumn = (c, l) => c.find((c) => GUESS[l].test(c)) ?? ``,
  DUPLICATE = {
    cis: `Duplicate CIS ID`,
    mobile: `Duplicate mobile number`,
    email: `Duplicate email address`,
  };
function checkRecipients(c, l, _) {
  let T = c.headers.indexOf(l),
    E = ID_LABEL[_],
    D = new Set(),
    O = c.rows.map((c, l) => {
      let O = T >= 0 ? (c[T] ?? ``).trim() : ``,
        A =
          _ === `mobile`
            ? O.replace(/[\s-]/g, ``)
            : _ === `email`
              ? O.toLowerCase()
              : O,
        j = [];
      return (
        A
          ? _ === `mobile` && !MOBILE.test(A)
            ? j.push(`Invalid mobile number`)
            : _ === `email` && !EMAIL.test(A)
              ? j.push(`Invalid email address`)
              : D.has(A) && j.push(DUPLICATE[_])
          : j.push(`${E} is required`),
        A && D.add(A),
        { line: l + 2, id: O, errors: j }
      );
    }),
    A = O.filter((c) => c.errors.length).length;
  return { rows: O, valid: O.length - A, invalid: A };
}
var fieldsOf = (c, l) =>
    (c?.headers ?? [])
      .filter((c) => c && c !== l)
      .map((c) => ({ column: c, token: `{{${c}}}` })),
  MESSAGE_MAX = 1e3;
function smsInfo(c) {
  let l = /[^\x00-\x7F]/.test(c),
    _ = l ? 70 : 160,
    T = l ? 67 : 153,
    E = [...c].length;
  return {
    unicode: l,
    length: E,
    single: _,
    segments: E === 0 ? 0 : E <= _ ? 1 : Math.ceil(E / T),
  };
}
var DAYS = [
    { day: 1, label: `Mon` },
    { day: 2, label: `Tue` },
    { day: 3, label: `Wed` },
    { day: 4, label: `Thu` },
    { day: 5, label: `Fri` },
    { day: 6, label: `Sat` },
    { day: 0, label: `Sun` },
  ],
  TIMES = Array.from(
    { length: 48 },
    (c, l) =>
      `${String(Math.floor(l / 2)).padStart(2, `0`)}:${l % 2 ? `30` : `00`}`,
  ),
  DEFAULT_DND = {
    enabled: !0,
    days: [1, 2, 3, 4, 5],
    from: `20:00`,
    to: `08:00`,
    timeZone: `Asia/Bangkok`,
  },
  TIME_ZONES = [{ value: `Asia/Bangkok`, label: `Asia/Bangkok (GMT+7)` }],
  minutes = (c) => {
    let [l, _] = c.split(`:`).map(Number);
    return l * 60 + _;
  },
  at = (c, l, _ = 0) => {
    let T = new Date(c);
    return (
      T.setHours(0, 0, 0, 0),
      T.setDate(T.getDate() + _),
      T.setMinutes(minutes(l)),
      T
    );
  };
function quietUntil(c, l) {
  if (!l.enabled || !l.days.length || l.from === l.to) return null;
  let _ = minutes(l.from) > minutes(l.to);
  for (let T of [1, 0]) {
    let E = at(c, `00:00`, -T);
    if (!l.days.includes(E.getDay())) continue;
    let D = at(E, l.from),
      O = at(E, l.to, +!!_);
    if (c >= D && c < O) return O;
  }
  return null;
}
function firstSend(c, l) {
  let _ = c;
  for (let c = 0; c < 14; c++) {
    let c = quietUntil(_, l);
    if (!c) return _;
    _ = c;
  }
  return _;
}
var fmtDateTime = (c) =>
    `${String(c.getDate()).padStart(2, `0`)} ${c.toLocaleString(`en-US`, { month: `short` })} ${c.getFullYear()}, ${String(c.getHours()).padStart(2, `0`)}:${String(c.getMinutes()).padStart(2, `0`)}`,
  fmtDays = (c) => {
    let l = DAYS.map((c) => c.day).filter((l) => c.includes(l));
    return l.join() === `1,2,3,4,5`
      ? `Mon – Fri`
      : l.length === 7
        ? `Every day`
        : l.map((c) => DAYS.find((l) => l.day === c).label).join(`, `);
  },
  fmtDnd = (c) =>
    c.enabled ? `${fmtDays(c.days)}, ${c.from}–${c.to} (${c.timeZone})` : `Off`,
  content = (c, l = ``, _ = c) => ({
    smsMessage: c,
    emailSubject: l,
    emailBody: _,
    pushTitle: l,
    pushBody: c,
  }),
  cis = { recipientType: `cis`, recipientColumn: `CIS_ID` },
  FIRST = [
    `Somchai`,
    `Araya`,
    `Nattapong`,
    `Siriporn`,
    `Thanapol`,
    `Kanya`,
    `Piti`,
    `Mana`,
  ],
  LAST = [
    `Yimdee`,
    `Chaisri`,
    `Wongsa`,
    `Klaykeaw`,
    `Suksai`,
    `Thongdee`,
    `Chaiyo`,
    `Deejai`,
  ],
  cisFile = (c) =>
    `CIS_ID,CUSTOMER_NAME,ACCOUNT_NO,AMOUNT,PROMOTION_CODE
` +
    Array.from(
      { length: c },
      (c, l) =>
        `${200001 + l},${FIRST[l % 8]} ${LAST[(l * 3) % 8]},${String(1e9 + l * 7919).slice(0, 10)},${(250 + ((l * 37) % 2e3)).toFixed(2)},NOV26`,
    ).join(`
`) +
    `
`,
  BROADCASTS = [
    {
      id: `BC-0007`,
      name: `November statement notice`,
      description: `Draft for the November statement campaign.`,
      channels: [`Email`],
      audienceFile: `statement-november.csv`,
      audienceText: cisFile(640),
      recipients: 640,
      ...cis,
      startMode: `schedule`,
      start: `2026-11-02T09:00`,
      dnd: DEFAULT_DND,
      status: `Draft`,
      success: 0,
      failed: 0,
      content: content(``, `Your November statement`, ``),
      createdBy: `Panisa R.`,
      createdAt: `2026-10-06T09:40`,
    },
    {
      id: `BC-0006`,
      name: `October Customer Campaign`,
      description: `Send payment confirmation and special offer to selected customers in October.`,
      channels: [`Email`, `SMS`, `Push notification`],
      audienceFile: `customer_list_october.csv`,
      recipients: 1e3,
      ...cis,
      startMode: `schedule`,
      start: `2026-10-12T09:00`,
      dnd: DEFAULT_DND,
      status: `Scheduled`,
      success: 0,
      failed: 0,
      content: content(
        `Dear {{CUSTOMER_NAME}}, your payment of THB {{AMOUNT}} was successful.`,
        `Special offer for {{CUSTOMER_NAME}}`,
      ),
      createdBy: `Panisa R.`,
      createdAt: `2026-10-05T10:12`,
    },
    {
      id: `BC-0005`,
      name: `Interest rate update`,
      description: ``,
      channels: [`SMS`],
      audienceFile: `savings-mobile.csv`,
      recipients: 1e3,
      recipientType: `direct`,
      recipientColumn: `MOBILE_NO`,
      startMode: `now`,
      start: `2026-10-05T10:00`,
      dnd: DEFAULT_DND,
      status: `Sending`,
      success: 612,
      failed: 9,
      content: content(
        `Dear Customer, effective 1 November 2026, our savings account interest rate will be updated. Thank you.`,
      ),
      createdBy: `Panisa R.`,
      createdAt: `2026-10-05T10:00`,
    },
    {
      id: `BC-0004`,
      name: `Branch closure notice`,
      description: `Branch BKK-12, closed 10 October.`,
      channels: [`Push notification`, `SMS`],
      audienceFile: `branch-bkk-12.csv`,
      recipients: 860,
      ...cis,
      startMode: `schedule`,
      start: `2026-10-03T19:00`,
      dnd: DEFAULT_DND,
      status: `Paused`,
      success: 402,
      failed: 3,
      content: content(
        `Dear Customer, our branch will be closed on 10 October 2026.`,
        `Branch closure`,
      ),
      createdBy: `Somchai J.`,
      createdAt: `2026-10-02T11:05`,
    },
    {
      id: `BC-0003`,
      name: `App maintenance`,
      description: ``,
      channels: [`Push notification`],
      audienceFile: `mbanking-active.csv`,
      recipients: 998,
      ...cis,
      startMode: `now`,
      start: `2026-09-29T08:15`,
      dnd: { ...DEFAULT_DND, enabled: !1 },
      status: `Completed`,
      success: 991,
      failed: 7,
      content: content(
        `Bualuang mBanking will be unavailable on 30 Sep 2026, 00:00–04:00.`,
        `Scheduled maintenance`,
      ),
      createdBy: `Panisa R.`,
      createdAt: `2026-09-29T08:15`,
    },
    {
      id: `BC-0002`,
      name: `Credit card statement reminder`,
      description: ``,
      channels: [`Email`],
      audienceFile: `cc-statement.csv`,
      recipients: 1e3,
      recipientType: `direct`,
      recipientColumn: `EMAIL`,
      startMode: `schedule`,
      start: `2026-09-21T07:00`,
      dnd: DEFAULT_DND,
      status: `Completed`,
      success: 988,
      failed: 12,
      content: content(
        ``,
        `Your statement is ready`,
        `Your credit card statement is ready.`,
      ),
      createdBy: `Naree R.`,
      createdAt: `2026-09-19T14:30`,
    },
  ],
  STATUS_TONE = {
    Draft: `caution`,
    Scheduled: `disabled`,
    Sending: `accent`,
    Paused: `caution`,
    Completed: `positive`,
  },
  EMPTY = `–`,
  n$2 = (c) => c.toLocaleString(`en-US`);
function BroadcastList({
  broadcasts: c,
  onCreate: l,
  onOpen: _,
  created: T,
  holdToast: E,
  onCreatedClose: D,
}) {
  let [O, A] = (0, import_react.useState)(0),
    j = Math.max(1, Math.ceil(c.length / 50)),
    M = Math.min(O, j - 1),
    N = c.slice(M * 50, M * 50 + 50);
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-list`,
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-list__header`,
        children: [
          (0, import_jsx_runtime.jsx)(`h1`, {
            className: `cnh-list__title`,
            children: BROADCAST_COPY.listTitle,
          }),
          (0, import_jsx_runtime.jsx)(Button, {
            label: BROADCAST_COPY.create,
            hasIcon: !0,
            icon: (0, import_jsx_runtime.jsx)(Icon, {
              slug: `plus`,
              size: 16,
              color: `currentColor`,
            }),
            onClick: l,
          }),
        ],
      }),
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-list__body`,
        children: [
          (0, import_jsx_runtime.jsx)(`div`, {
            className: `cnh-list__table-scroll cnh-bc-list__scroll`,
            children:
              c.length === 0
                ? (0, import_jsx_runtime.jsx)(`div`, {
                    className: `cnh-list__card-wrap`,
                    children: (0, import_jsx_runtime.jsx)(`div`, {
                      className: `cnh-list__card`,
                      children: (0, import_jsx_runtime.jsx)(`div`, {
                        className: `cnh-list__centred`,
                        children: (0, import_jsx_runtime.jsxs)(`div`, {
                          className: `cnh-list__state-block`,
                          children: [
                            (0, import_jsx_runtime.jsx)(`p`, {
                              className: `cnh-list__state-title`,
                              children: BROADCAST_COPY.emptyTitle,
                            }),
                            (0, import_jsx_runtime.jsx)(`p`, {
                              className: `cnh-list__state-line`,
                              children: BROADCAST_COPY.emptyLine,
                            }),
                            (0, import_jsx_runtime.jsx)(Button, {
                              label: BROADCAST_COPY.create,
                              onClick: l,
                            }),
                          ],
                        }),
                      }),
                    }),
                  })
                : (0, import_jsx_runtime.jsx)(TableContainer, {
                    className: `cnh-list__table`,
                    children: (0, import_jsx_runtime.jsxs)(Table, {
                      "aria-label": BROADCAST_COPY.listTitle,
                      children: [
                        (0, import_jsx_runtime.jsxs)(`colgroup`, {
                          children: [
                            (0, import_jsx_runtime.jsx)(`col`, {
                              style: { width: 300 },
                            }),
                            (0, import_jsx_runtime.jsx)(`col`, {
                              style: { width: 260 },
                            }),
                            (0, import_jsx_runtime.jsx)(`col`, {
                              style: { width: 160 },
                            }),
                            (0, import_jsx_runtime.jsx)(`col`, {
                              style: { width: 220 },
                            }),
                            (0, import_jsx_runtime.jsx)(`col`, {
                              style: { width: 220 },
                            }),
                            (0, import_jsx_runtime.jsx)(`col`, {
                              style: { width: 240 },
                            }),
                            (0, import_jsx_runtime.jsx)(`col`, {
                              style: { width: 200 },
                            }),
                          ],
                        }),
                        (0, import_jsx_runtime.jsx)(TableHead, {
                          children: (0, import_jsx_runtime.jsx)(TableRow, {
                            heights: `64px`,
                            headerRowColor: `var(--colorSurfacePrimaryHovered)`,
                            children: [
                              `Broadcast name`,
                              `Channel`,
                              `Recipients`,
                              `Broadcast start`,
                              `Do Not Disturb`,
                              `Result`,
                              `Status`,
                            ].map((c) =>
                              (0, import_jsx_runtime.jsx)(
                                TableCell,
                                {
                                  type: `Slot`,
                                  appearance: `Default`,
                                  align: `left`,
                                  slots: (0, import_jsx_runtime.jsx)(`span`, {
                                    className: `cnh-list__th`,
                                    children: c,
                                  }),
                                },
                                c,
                              ),
                            ),
                          }),
                        }),
                        (0, import_jsx_runtime.jsx)(TableBody, {
                          children: N.map((c) => {
                            let l = c.success + c.failed;
                            return (0, import_jsx_runtime.jsxs)(
                              TableRow,
                              {
                                heights: `64px`,
                                showHover: !0,
                                hoverBackgroundColor: `var(--colorSurfaceSecondaryDefault)`,
                                onClick: () => _(c),
                                className: `cnh-list__row`,
                                children: [
                                  (0, import_jsx_runtime.jsx)(TableCell, {
                                    type: `Text`,
                                    appearance: `Default`,
                                    align: `left`,
                                    children: (0, import_jsx_runtime.jsx)(
                                      `span`,
                                      {
                                        className: `cnh-list__cell`,
                                        children: c.name,
                                      },
                                    ),
                                  }),
                                  (0, import_jsx_runtime.jsx)(TableCell, {
                                    type: `Text`,
                                    appearance: `Default`,
                                    align: `left`,
                                    children: (0, import_jsx_runtime.jsx)(
                                      `span`,
                                      {
                                        className: `cnh-list__cell cnh-list__cell--wrap`,
                                        children: c.channels.join(`, `),
                                      },
                                    ),
                                  }),
                                  (0, import_jsx_runtime.jsx)(TableCell, {
                                    type: `Text`,
                                    appearance: `Default`,
                                    align: `left`,
                                    children: (0, import_jsx_runtime.jsx)(
                                      `span`,
                                      {
                                        className: `cnh-list__cell`,
                                        children: n$2(c.recipients),
                                      },
                                    ),
                                  }),
                                  (0, import_jsx_runtime.jsx)(TableCell, {
                                    type: `Text`,
                                    appearance: `Default`,
                                    align: `left`,
                                    children: (0, import_jsx_runtime.jsx)(
                                      `span`,
                                      {
                                        className: `cnh-list__cell`,
                                        children: fmtDateTime(
                                          new Date(c.start),
                                        ),
                                      },
                                    ),
                                  }),
                                  (0, import_jsx_runtime.jsx)(TableCell, {
                                    type: `Text`,
                                    appearance: `Default`,
                                    align: `left`,
                                    children: (0, import_jsx_runtime.jsx)(
                                      `span`,
                                      {
                                        className: `cnh-list__cell`,
                                        children: c.dnd.enabled
                                          ? `${fmtDays(c.dnd.days)}, ${c.dnd.from}–${c.dnd.to}`
                                          : `Off`,
                                      },
                                    ),
                                  }),
                                  (0, import_jsx_runtime.jsx)(TableCell, {
                                    type: `Text`,
                                    appearance: `Default`,
                                    align: `left`,
                                    children: (0, import_jsx_runtime.jsx)(
                                      `span`,
                                      {
                                        className: `cnh-list__cell`,
                                        children:
                                          l === 0
                                            ? EMPTY
                                            : (0, import_jsx_runtime.jsxs)(
                                                import_jsx_runtime.Fragment,
                                                {
                                                  children: [
                                                    n$2(c.success),
                                                    ` sent · `,
                                                    ` `,
                                                    (0,
                                                    import_jsx_runtime.jsxs)(
                                                      `span`,
                                                      {
                                                        className: c.failed
                                                          ? `cnh-bc-list__failed`
                                                          : void 0,
                                                        children: [
                                                          n$2(c.failed),
                                                          ` failed`,
                                                        ],
                                                      },
                                                    ),
                                                  ],
                                                },
                                              ),
                                      },
                                    ),
                                  }),
                                  (0, import_jsx_runtime.jsx)(TableCell, {
                                    type: `Slot`,
                                    appearance: `Default`,
                                    align: `left`,
                                    slots: (0, import_jsx_runtime.jsx)(Badge, {
                                      label: c.status,
                                      type: STATUS_TONE[c.status],
                                      size: `xs`,
                                      showIcon: !1,
                                    }),
                                  }),
                                ],
                              },
                              c.id,
                            );
                          }),
                        }),
                      ],
                    }),
                  }),
          }),
          N.length > 0 &&
            (0, import_jsx_runtime.jsx)(`div`, {
              className: `cnh-list__pagination`,
              children: (0, import_jsx_runtime.jsx)(TablePagination, {
                count: c.length,
                rowsPerPage: 50,
                page: M,
                hasRangeSelect: !1,
                onPageChange: (c, l) => A(l),
              }),
            }),
        ],
      }),
      (0, import_jsx_runtime.jsx)(Toast, {
        open: T !== null,
        appearance: `positive`,
        title: T?.draft
          ? BROADCAST_COPY.draftTitle
          : BROADCAST_COPY.createdTitle,
        hasLeftIcon: !0,
        hasDescription: !0,
        description: T
          ? T.draft
            ? BROADCAST_COPY.draftBody(T.name)
            : BROADCAST_COPY.createdBody(T.name)
          : ``,
        hasCloseButton: !0,
        autoHideDuration: E ? null : 3e3,
        position: { vertical: `top`, horizontal: `right` },
        onClose: D,
      }),
    ],
  });
}
var require_dayjs_min = __commonJSMin((c, l) => {
    (function (_, T) {
      typeof c == `object` && l !== void 0
        ? (l.exports = T())
        : typeof define == `function` && define.amd
          ? define(T)
          : ((_ = typeof globalThis < `u` ? globalThis : _ || self).dayjs =
              T());
    })(c, function () {
      var c = 1e3,
        l = 6e4,
        _ = 36e5,
        T = `millisecond`,
        E = `second`,
        D = `minute`,
        O = `hour`,
        A = `day`,
        j = `week`,
        M = `month`,
        N = `quarter`,
        F = `year`,
        I = `date`,
        L = `Invalid Date`,
        R =
          /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
        z =
          /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
        B = {
          name: `en`,
          weekdays:
            `Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday`.split(
              `_`,
            ),
          months:
            `January_February_March_April_May_June_July_August_September_October_November_December`.split(
              `_`,
            ),
          ordinal: function (c) {
            var l = [`th`, `st`, `nd`, `rd`],
              _ = c % 100;
            return `[` + c + (l[(_ - 20) % 10] || l[_] || l[0]) + `]`;
          },
        },
        V = function (c, l, _) {
          var T = String(c);
          return !T || T.length >= l
            ? c
            : `` + Array(l + 1 - T.length).join(_) + c;
        },
        H = {
          s: V,
          z: function (c) {
            var l = -c.utcOffset(),
              _ = Math.abs(l),
              T = Math.floor(_ / 60),
              E = _ % 60;
            return (l <= 0 ? `+` : `-`) + V(T, 2, `0`) + `:` + V(E, 2, `0`);
          },
          m: function c(l, _) {
            if (l.date() < _.date()) return -c(_, l);
            var T = 12 * (_.year() - l.year()) + (_.month() - l.month()),
              E = l.clone().add(T, M),
              D = _ - E < 0,
              O = l.clone().add(T + (D ? -1 : 1), M);
            return +(-(T + (_ - E) / (D ? E - O : O - E)) || 0);
          },
          a: function (c) {
            return c < 0 ? Math.ceil(c) || 0 : Math.floor(c);
          },
          p: function (c) {
            return (
              { M, y: F, w: j, d: A, D: I, h: O, m: D, s: E, ms: T, Q: N }[c] ||
              String(c || ``)
                .toLowerCase()
                .replace(/s$/, ``)
            );
          },
          u: function (c) {
            return c === void 0;
          },
        },
        U = `en`,
        W = {};
      W[U] = B;
      var G = `$isDayjsObject`,
        K = function (c) {
          return c instanceof Z || !(!c || !c[G]);
        },
        q = function c(l, _, T) {
          var E;
          if (!l) return U;
          if (typeof l == `string`) {
            var D = l.toLowerCase();
            (W[D] && (E = D), _ && ((W[D] = _), (E = D)));
            var O = l.split(`-`);
            if (!E && O.length > 1) return c(O[0]);
          } else {
            var A = l.name;
            ((W[A] = l), (E = A));
          }
          return (!T && E && (U = E), E || (!T && U));
        },
        J = function (c, l) {
          if (K(c)) return c.clone();
          var _ = typeof l == `object` ? l : {};
          return ((_.date = c), (_.args = arguments), new Z(_));
        },
        X = H;
      ((X.l = q),
        (X.i = K),
        (X.w = function (c, l) {
          return J(c, { locale: l.$L, utc: l.$u, x: l.$x, $offset: l.$offset });
        }));
      var Z = (function () {
          function B(c) {
            ((this.$L = q(c.locale, null, !0)),
              this.parse(c),
              (this.$x = this.$x || c.x || {}),
              (this[G] = !0));
          }
          var V = B.prototype;
          return (
            (V.parse = function (c) {
              ((this.$d = (function (c) {
                var l = c.date,
                  _ = c.utc;
                if (l === null) return new Date(NaN);
                if (X.u(l)) return new Date();
                if (l instanceof Date) return new Date(l);
                if (typeof l == `string` && !/Z$/i.test(l)) {
                  var T = l.match(R);
                  if (T) {
                    var E = T[2] - 1 || 0,
                      D = (T[7] || `0`).substring(0, 3);
                    return _
                      ? new Date(
                          Date.UTC(
                            T[1],
                            E,
                            T[3] || 1,
                            T[4] || 0,
                            T[5] || 0,
                            T[6] || 0,
                            D,
                          ),
                        )
                      : new Date(
                          T[1],
                          E,
                          T[3] || 1,
                          T[4] || 0,
                          T[5] || 0,
                          T[6] || 0,
                          D,
                        );
                  }
                }
                return new Date(l);
              })(c)),
                this.init());
            }),
            (V.init = function () {
              var c = this.$d;
              ((this.$y = c.getFullYear()),
                (this.$M = c.getMonth()),
                (this.$D = c.getDate()),
                (this.$W = c.getDay()),
                (this.$H = c.getHours()),
                (this.$m = c.getMinutes()),
                (this.$s = c.getSeconds()),
                (this.$ms = c.getMilliseconds()));
            }),
            (V.$utils = function () {
              return X;
            }),
            (V.isValid = function () {
              return this.$d.toString() !== L;
            }),
            (V.isSame = function (c, l) {
              var _ = J(c);
              return this.startOf(l) <= _ && _ <= this.endOf(l);
            }),
            (V.isAfter = function (c, l) {
              return J(c) < this.startOf(l);
            }),
            (V.isBefore = function (c, l) {
              return this.endOf(l) < J(c);
            }),
            (V.$g = function (c, l, _) {
              return X.u(c) ? this[l] : this.set(_, c);
            }),
            (V.unix = function () {
              return Math.floor(this.valueOf() / 1e3);
            }),
            (V.valueOf = function () {
              return this.$d.getTime();
            }),
            (V.startOf = function (c, l) {
              var _ = this,
                T = !!X.u(l) || l,
                N = X.p(c),
                L = function (c, l) {
                  var E = X.w(
                    _.$u ? Date.UTC(_.$y, l, c) : new Date(_.$y, l, c),
                    _,
                  );
                  return T ? E : E.endOf(A);
                },
                R = function (c, l) {
                  return X.w(
                    _.toDate()[c].apply(
                      _.toDate(`s`),
                      (T ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(l),
                    ),
                    _,
                  );
                },
                z = this.$W,
                B = this.$M,
                V = this.$D,
                H = `set` + (this.$u ? `UTC` : ``);
              switch (N) {
                case F:
                  return T ? L(1, 0) : L(31, 11);
                case M:
                  return T ? L(1, B) : L(0, B + 1);
                case j:
                  var U = this.$locale().weekStart || 0,
                    W = (z < U ? z + 7 : z) - U;
                  return L(T ? V - W : V + (6 - W), B);
                case A:
                case I:
                  return R(H + `Hours`, 0);
                case O:
                  return R(H + `Minutes`, 1);
                case D:
                  return R(H + `Seconds`, 2);
                case E:
                  return R(H + `Milliseconds`, 3);
                default:
                  return this.clone();
              }
            }),
            (V.endOf = function (c) {
              return this.startOf(c, !1);
            }),
            (V.$set = function (c, l) {
              var _,
                j = X.p(c),
                N = `set` + (this.$u ? `UTC` : ``),
                L = ((_ = {}),
                (_[A] = N + `Date`),
                (_[I] = N + `Date`),
                (_[M] = N + `Month`),
                (_[F] = N + `FullYear`),
                (_[O] = N + `Hours`),
                (_[D] = N + `Minutes`),
                (_[E] = N + `Seconds`),
                (_[T] = N + `Milliseconds`),
                _)[j],
                R = j === A ? this.$D + (l - this.$W) : l;
              if (j === M || j === F) {
                var z = this.clone().set(I, 1);
                (z.$d[L](R),
                  z.init(),
                  (this.$d = z.set(I, Math.min(this.$D, z.daysInMonth())).$d));
              } else L && this.$d[L](R);
              return (this.init(), this);
            }),
            (V.set = function (c, l) {
              return this.clone().$set(c, l);
            }),
            (V.get = function (c) {
              return this[X.p(c)]();
            }),
            (V.add = function (T, N) {
              var I,
                L = this;
              T = Number(T);
              var R = X.p(N),
                z = function (c) {
                  var l = J(L);
                  return X.w(l.date(l.date() + Math.round(c * T)), L);
                };
              if (R === M) return this.set(M, this.$M + T);
              if (R === F) return this.set(F, this.$y + T);
              if (R === A) return z(1);
              if (R === j) return z(7);
              var B = ((I = {}), (I[D] = l), (I[O] = _), (I[E] = c), I)[R] || 1,
                V = this.$d.getTime() + T * B;
              return X.w(V, this);
            }),
            (V.subtract = function (c, l) {
              return this.add(-1 * c, l);
            }),
            (V.format = function (c) {
              var l = this,
                _ = this.$locale();
              if (!this.isValid()) return _.invalidDate || L;
              var T = c || `YYYY-MM-DDTHH:mm:ssZ`,
                E = X.z(this),
                D = this.$H,
                O = this.$m,
                A = this.$M,
                j = _.weekdays,
                M = _.months,
                N = _.meridiem,
                F = function (c, _, E, D) {
                  return (c && (c[_] || c(l, T))) || E[_].slice(0, D);
                },
                I = function (c) {
                  return X.s(D % 12 || 12, c, `0`);
                },
                R =
                  N ||
                  function (c, l, _) {
                    var T = c < 12 ? `AM` : `PM`;
                    return _ ? T.toLowerCase() : T;
                  };
              return T.replace(z, function (c, T) {
                return (
                  T ||
                  (function (c) {
                    switch (c) {
                      case `YY`:
                        return String(l.$y).slice(-2);
                      case `YYYY`:
                        return X.s(l.$y, 4, `0`);
                      case `M`:
                        return A + 1;
                      case `MM`:
                        return X.s(A + 1, 2, `0`);
                      case `MMM`:
                        return F(_.monthsShort, A, M, 3);
                      case `MMMM`:
                        return F(M, A);
                      case `D`:
                        return l.$D;
                      case `DD`:
                        return X.s(l.$D, 2, `0`);
                      case `d`:
                        return String(l.$W);
                      case `dd`:
                        return F(_.weekdaysMin, l.$W, j, 2);
                      case `ddd`:
                        return F(_.weekdaysShort, l.$W, j, 3);
                      case `dddd`:
                        return j[l.$W];
                      case `H`:
                        return String(D);
                      case `HH`:
                        return X.s(D, 2, `0`);
                      case `h`:
                        return I(1);
                      case `hh`:
                        return I(2);
                      case `a`:
                        return R(D, O, !0);
                      case `A`:
                        return R(D, O, !1);
                      case `m`:
                        return String(O);
                      case `mm`:
                        return X.s(O, 2, `0`);
                      case `s`:
                        return String(l.$s);
                      case `ss`:
                        return X.s(l.$s, 2, `0`);
                      case `SSS`:
                        return X.s(l.$ms, 3, `0`);
                      case `Z`:
                        return E;
                    }
                    return null;
                  })(c) ||
                  E.replace(`:`, ``)
                );
              });
            }),
            (V.utcOffset = function () {
              return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
            }),
            (V.diff = function (T, I, L) {
              var R,
                z = this,
                B = X.p(I),
                V = J(T),
                H = (V.utcOffset() - this.utcOffset()) * l,
                U = this - V,
                W = function () {
                  return X.m(z, V);
                };
              switch (B) {
                case F:
                  R = W() / 12;
                  break;
                case M:
                  R = W();
                  break;
                case N:
                  R = W() / 3;
                  break;
                case j:
                  R = (U - H) / 6048e5;
                  break;
                case A:
                  R = (U - H) / 864e5;
                  break;
                case O:
                  R = U / _;
                  break;
                case D:
                  R = U / l;
                  break;
                case E:
                  R = U / c;
                  break;
                default:
                  R = U;
              }
              return L ? R : X.a(R);
            }),
            (V.daysInMonth = function () {
              return this.endOf(M).$D;
            }),
            (V.$locale = function () {
              return W[this.$L];
            }),
            (V.locale = function (c, l) {
              if (!c) return this.$L;
              var _ = this.clone(),
                T = q(c, l, !0);
              return (T && (_.$L = T), _);
            }),
            (V.clone = function () {
              return X.w(this.$d, this);
            }),
            (V.toDate = function () {
              return new Date(this.valueOf());
            }),
            (V.toJSON = function () {
              return this.isValid() ? this.toISOString() : null;
            }),
            (V.toISOString = function () {
              return this.$d.toISOString();
            }),
            (V.toString = function () {
              return this.$d.toUTCString();
            }),
            B
          );
        })(),
        Q = Z.prototype;
      return (
        (J.prototype = Q),
        [
          [`$ms`, T],
          [`$s`, E],
          [`$m`, D],
          [`$H`, O],
          [`$W`, A],
          [`$M`, M],
          [`$y`, F],
          [`$D`, I],
        ].forEach(function (c) {
          Q[c[1]] = function (l) {
            return this.$g(l, c[0], c[1]);
          };
        }),
        (J.extend = function (c, l) {
          return ((c.$i ||= (c(l, Z, J), !0)), J);
        }),
        (J.locale = q),
        (J.isDayjs = K),
        (J.unix = function (c) {
          return J(1e3 * c);
        }),
        (J.en = W[U]),
        (J.Ls = W),
        (J.p = {}),
        J
      );
    });
  }),
  import_dayjs_min = __toESM(require_dayjs_min()),
  FORM_PRESETS = [
    `file-error`,
    `cis`,
    `direct`,
    `errors`,
    `draft-no-name`,
    `filled`,
    `quiet`,
    `confirm`,
    `submitting`,
    `fail-dialog`,
    `leave`,
  ],
  LIST_PRESETS = [`submitted`, `draft-saved`],
  formPreset = (c) => (FORM_PRESETS.includes(c ?? ``) ? c : void 0),
  listPreset = (c) => (LIST_PRESETS.includes(c ?? ``) ? c : void 0),
  CIS_CSV = `CIS_ID,CUSTOMER_NAME,ACCOUNT_NO,AMOUNT,PROMOTION_CODE
100001,Somchai Yimdee,1234567890,1250.00,OCT24
100002,Araya Chaisri,9876543210,860.50,OCT24
100003,Nattapong Wongsa,4567891230,2100.00,OCT24
100004,Siriporn Klaykeaw,3216549870,750.25,OCT24
100005,Thanapol Suksai,1597534860,433.00,OCT24
100006,Kanya Thongdee,7531598520,1999.00,OCT24
100007,Piti Chaiyo,8524569630,320.00,OCT24
100008,Mana Deejai,9638527410,1500.75,OCT24
`,
  DIRECT_CSV = `MOBILE_NO,EMAIL,CUSTOMER_NAME,AMOUNT,PROMOTION_CODE
0812345678,somchai@email.com,Somchai Yimdee,1250.00,OCT24
0898765432,araya@email.com,Araya Chaisri,860.50,OCT24
0611122233,nattapong@email.com,Nattapong Wongsa,2100.00,OCT24
0812345678,siriporn@email,Siriporn Klaykeaw,750.25,OCT24
08-1234,,Thanapol Suksai,433.00,OCT24
+66812223333,kanya@email.com,Kanya Thongdee,1999.00,OCT24
`,
  MESSAGE = `Dear {{CUSTOMER_NAME}},
Your payment of THB {{AMOUNT}} was successful.
Reference: {{ACCOUNT_NO}}.`,
  SUBJECT = `Special offer for {{CUSTOMER_NAME}}`,
  filled = {
    file: { name: `audience-cis.csv`, text: CIS_CSV },
    recipientType: `cis`,
    column: `CIS_ID`,
    channels: [`Email`, `SMS`],
    name: `October Customer Campaign`,
    description: `Send payment confirmation and special offer to selected customers in October.`,
    content: {
      smsMessage: MESSAGE,
      emailSubject: SUBJECT,
      emailBody: MESSAGE,
      pushTitle: SUBJECT,
      pushBody: MESSAGE,
    },
  },
  nextWeekday = () => {
    let c = new Date();
    for (let l = 1; l <= 7; l++) {
      let _ = new Date(c);
      if ((_.setDate(c.getDate() + l), _.getDay() >= 1 && _.getDay() <= 4))
        return l;
    }
    return 1;
  };
function formSeed(c) {
  switch (c) {
    case `file-error`:
      return {
        file: {
          name: `recipients.txt`,
          text: `CIS_ID
100001
`,
        },
      };
    case `cis`:
      return { file: filled.file, recipientType: `cis`, column: `CIS_ID` };
    case `direct`:
      return {
        file: { name: `audience-direct.csv`, text: DIRECT_CSV },
        recipientType: `direct`,
        column: `MOBILE_NO`,
        channels: [`SMS`],
      };
    case `errors`:
      return { press: `submit` };
    case `draft-no-name`:
      return { press: `draft` };
    case `filled`:
      return filled;
    case `quiet`:
      return {
        ...filled,
        mode: `schedule`,
        start: { inDays: nextWeekday(), time: `21:00` },
        dnd: DEFAULT_DND,
      };
    case `confirm`:
      return { ...filled, open: `confirm` };
    case `submitting`:
      return { ...filled, open: `submitting` };
    case `fail-dialog`:
      return { ...filled, open: `fail` };
    case `leave`:
      return { ...filled, open: `leave` };
  }
}
var LIST_TOAST = {
    submitted: { name: `October Customer Campaign`, draft: !1 },
    "draft-saved": { name: `October Customer Campaign`, draft: !0 },
  },
  CHECK_MS = 600,
  CREATE_MS = 900,
  CHANNEL_FIELDS = {
    "Push notification": [`pushTitle`, `pushBody`],
    Email: [`emailSubject`, `emailBody`],
    SMS: [`smsMessage`],
  },
  DIRECT_CHANNELS = [`Email`, `SMS`],
  EMPTY_CONTENT = {
    smsMessage: ``,
    emailSubject: ``,
    emailBody: ``,
    pushTitle: ``,
    pushBody: ``,
  },
  combine = (c, l) =>
    c && l
      ? c
          .hour(Number(l.slice(0, 2)))
          .minute(Number(l.slice(3)))
          .second(0)
          .millisecond(0)
          .toDate()
      : null,
  iso = (c) => (0, import_dayjs_min.default)(c).format(`YYYY-MM-DDTHH:mm`),
  fromDraft = (c) => ({
    file:
      c.audienceText === void 0
        ? void 0
        : { name: c.audienceFile, text: c.audienceText },
    recipientType: c.recipientType,
    column: c.recipientColumn,
    channels: c.channels,
    name: c.name,
    description: c.description,
    content: c.content,
    mode: c.startMode,
    dnd: c.dnd,
  });
function useBroadcastForm({ onCreate: c, failNext: l, preset: _, initial: T }) {
  let [E] = (0, import_react.useState)(() =>
      T ? fromDraft(T) : _ ? formSeed(_) : {},
    ),
    [D, O] = (0, import_react.useState)({}),
    [A, j] = (0, import_react.useState)(E.name ?? ``),
    [M, N] = (0, import_react.useState)(E.description ?? ``),
    [F, I] = (0, import_react.useState)(() =>
      E.file
        ? new File([E.file.text], E.file.name, { type: `text/csv` })
        : null,
    ),
    [L, R] = (0, import_react.useState)(() =>
      E.file ? readAudience(E.file.name, E.file.text) : null,
    ),
    [z, B] = (0, import_react.useState)(E.file?.text ?? ``),
    [V, H] = (0, import_react.useState)(E.recipientType ?? `cis`),
    [U, W] = (0, import_react.useState)(E.column ?? ``),
    [G, K] = (0, import_react.useState)(E.channels ?? []),
    [q, J] = (0, import_react.useState)(E.content ?? EMPTY_CONTENT),
    [X, Z] = (0, import_react.useState)(E.mode ?? `now`),
    Q =
      T?.startMode === `schedule`
        ? (0, import_dayjs_min.default)(T.start)
        : null,
    [$, ee] = (0, import_react.useState)(() =>
      Q
        ? Q.startOf(`day`)
        : E.start
          ? (0, import_dayjs_min.default)()
              .add(E.start.inDays, `day`)
              .startOf(`day`)
          : null,
    ),
    [te, ne] = (0, import_react.useState)(
      Q ? Q.format(`HH:mm`) : (E.start?.time ?? ``),
    ),
    [re, ie] = (0, import_react.useState)(E.dnd ?? DEFAULT_DND),
    [ae, oe] = (0, import_react.useState)(E.open === `leave`),
    [se, ce] = (0, import_react.useState)(E.open === `confirm`),
    [le, ue] = (0, import_react.useState)(E.open === `submitting`),
    [de, fe] = (0, import_react.useState)(E.open === `fail`),
    [pe, me] = (0, import_react.useState)(!!l),
    he = L && L.ok ? L.audience : null,
    ge = idKind(V, G),
    _e = (0, import_react.useMemo)(
      () => (he && U && ge ? checkRecipients(he, U, ge) : null),
      [he, U, ge],
    ),
    ve = (0, import_react.useMemo)(() => fieldsOf(he, U), [he, U]),
    ye = F !== null && L === null,
    be = !!(F || A || M || G.length || Object.values(q).some(Boolean)),
    xe = V === `direct` ? DIRECT_CHANNELS : CHANNELS,
    Se = (...c) =>
      O((l) => {
        let _ = { ...l };
        for (let l of c) delete _[l];
        return _;
      }),
    Ce = (c, l) => (_) => {
      (l(_), Se(c));
    },
    we = (c) => Ce(c, (l) => J((_) => ({ ..._, [c]: l }))),
    Te = (c) => {
      let l = c?.[0];
      l &&
        (I(l),
        R(null),
        B(``),
        l.text().then(B, () => B(``)),
        Se(`file`, `column`),
        readAudienceFile(l).then((c) =>
          window.setTimeout(() => {
            (R(c), c.ok && ge ? W(guessColumn(c.audience.headers, ge)) : W(``));
          }, CHECK_MS),
        ));
    },
    Ee = () => {
      (I(null), R(null), B(``), W(``));
    },
    De = (c) => {
      H(c);
      let l =
        c === `direct`
          ? G.filter((c) => DIRECT_CHANNELS.includes(c)).slice(0, 1)
          : G;
      K(l);
      let _ = idKind(c, l);
      (W(he && _ ? guessColumn(he.headers, _) : ``),
        Se(`channels`, `column`, `file`));
    },
    Oe = (c, l) => {
      (K((_) =>
        l
          ? CHANNELS.filter((l) => l === c || _.includes(l))
          : _.filter((l) => l !== c),
      ),
        Se(`channels`, ...(l ? [] : CHANNEL_FIELDS[c])));
    },
    ke = (c) => {
      K([c]);
      let l = idKind(`direct`, [c]);
      (he && l && W(guessColumn(he.headers, l) || U),
        Se(
          `channels`,
          `column`,
          `file`,
          ...CHANNEL_FIELDS[c === `SMS` ? `Email` : `SMS`],
        ));
    },
    Ae = X === `now` ? new Date() : combine($, te),
    je = Ae ? firstSend(Ae, re) : null,
    Me = !!(Ae && je && je.getTime() !== Ae.getTime()),
    Ne = (c) => {
      (ie((l) => ({ ...l, ...c })), Se(`dndDays`, `dndTime`));
    },
    Pe = () => {
      let c = {};
      (A.trim()
        ? A.length > 100 && (c.name = BROADCAST_COPY.msgMax(100))
        : (c.name = BROADCAST_COPY.required),
        M.length > 250 && (c.description = BROADCAST_COPY.msgMax(250)),
        F
          ? L && !L.ok && (c.file = L.message)
          : (c.file = BROADCAST_COPY.noFile),
        V === `direct` && !G.length
          ? (c.channels = BROADCAST_COPY.noDirectChannel)
          : G.length || (c.channels = BROADCAST_COPY.noChannel),
        he && ge && !U && (c.column = BROADCAST_COPY.noColumn),
        _e && _e.valid === 0 && (c.file = BROADCAST_COPY.noValidRows));
      for (let l of G)
        for (let _ of CHANNEL_FIELDS[l])
          q[_].trim() || (c[_] = BROADCAST_COPY.required);
      return (
        G.includes(`Push notification`) &&
          q.pushBody.length > 250 &&
          (c.pushBody = BROADCAST_COPY.msgMax(250)),
        G.includes(`Email`) &&
          q.emailSubject.length > 100 &&
          (c.emailSubject = BROADCAST_COPY.msgMax(100)),
        G.includes(`Email`) &&
          q.emailBody.length > 1e3 &&
          (c.emailBody = BROADCAST_COPY.msgMax(MESSAGE_MAX)),
        X === `schedule` &&
          ($ || (c.startDate = BROADCAST_COPY.required),
          te || (c.startTime = BROADCAST_COPY.required),
          Ae && Ae <= new Date() && (c.startDate = BROADCAST_COPY.startPast)),
        re.enabled && !re.days.length && (c.dndDays = BROADCAST_COPY.dndNoDay),
        re.enabled && re.from === re.to && (c.dndTime = BROADCAST_COPY.dndSame),
        c
      );
    },
    Fe = (c) =>
      requestAnimationFrame(() =>
        c
          ?.querySelector(`[data-error="true"]`)
          ?.scrollIntoView({ block: `center`, behavior: `smooth` }),
      ),
    Ie = (c) => {
      if (ye) return;
      let l = Pe();
      if ((O(l), Object.keys(l).length)) return Fe(c);
      ce(!0);
    },
    Le = (c) => ({
      name: A.trim(),
      description: M.trim(),
      channels: CHANNELS.filter((c) => G.includes(c)),
      audienceFile: F?.name ?? ``,
      audienceText: F ? z : void 0,
      recipients: _e?.valid ?? 0,
      recipientType: V,
      recipientColumn: U,
      startMode: X,
      start: iso(Ae ?? new Date()),
      dnd: re,
      status: c,
      success: 0,
      failed: 0,
      content: q,
      createdBy: T?.createdBy ?? `Panisa R.`,
      createdAt: T?.createdAt ?? iso(new Date()),
    }),
    Re = () => {
      (ce(!1),
        ue(!0),
        window.setTimeout(() => {
          if ((ue(!1), pe)) return (me(!1), fe(!0));
          c(Le(X === `now` && !Me ? `Sending` : `Scheduled`), `submitted`);
        }, CREATE_MS));
    },
    ze = (l) => {
      if (!A.trim()) return (O({ name: BROADCAST_COPY.draftNeedsName }), Fe(l));
      c(Le(`Draft`), `draft`);
    };
  return (
    (0, import_react.useEffect)(() => {
      (E.press === `submit` && Ie(null), E.press === `draft` && ze(null));
    }, []),
    {
      editing: !!T,
      errors: D,
      setErrors: O,
      clear: Se,
      edit: Ce,
      setC: we,
      name: A,
      setName: j,
      description: M,
      setDescription: N,
      file: F,
      read: L,
      audience: he,
      check: _e,
      checking: ye,
      pick: Te,
      clearFile: Ee,
      recipientType: V,
      setRecipientType: De,
      column: U,
      setColumn: W,
      kind: ge,
      offered: xe,
      channels: G,
      toggleChannel: Oe,
      chooseDirect: ke,
      content: q,
      setContent: J,
      fields: ve,
      mode: X,
      setMode: Z,
      startDate: $,
      setStartDate: ee,
      startTime: te,
      setStartTime: ne,
      start: Ae,
      first: je,
      waits: Me,
      dnd: re,
      setDndPart: Ne,
      dirty: be,
      leaveOpen: ae,
      setLeaveOpen: oe,
      confirmOpen: se,
      setConfirmOpen: ce,
      creating: le,
      failed: de,
      setFailed: fe,
      submit: Ie,
      create: Re,
      saveDraft: ze,
    }
  );
}
var sizeLabel = (c) =>
    c < 1048576
      ? `${Math.max(1, Math.round(c / 1024))} KB`
      : `${(c / 1024 / 1024).toFixed(1)} MB`,
  n$1 = (c) => c.toLocaleString(`en-US`),
  CHANNEL_ICON = {
    Email: `mail`,
    SMS: `message`,
    "Push notification": `alert`,
  },
  SELECT_MENU_PROPS = {
    classes: { paper: `cnh-form__menu` },
    anchorOrigin: { vertical: `bottom`, horizontal: `left` },
    transformOrigin: { vertical: `top`, horizontal: `left` },
  };
function Section({ title: c, alert: l, bare: _, children: T }) {
  return (0, import_jsx_runtime.jsxs)(`section`, {
    className: `cnh-form__step`,
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-form__step-head`,
        children: [
          (0, import_jsx_runtime.jsx)(`h2`, {
            className: `cnh-form__step-title`,
            children: c,
          }),
          l,
        ],
      }),
      _
        ? T
        : (0, import_jsx_runtime.jsx)(CardSurface, {
            type: `default`,
            tabIndex: -1,
            width: `100%`,
            padding: `var(--floatGenericSpace6)`,
            borderRadius: `var(--floatRadius2)`,
            backgroundColor: `var(--colorSurfacePrimaryDefault)`,
            className: `cnh-form__card cnh-bc__card`,
            children: T,
          }),
    ],
  });
}
function BasicInfo({ f: c, nameMax: l, descriptionMax: _ }) {
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-form__row`,
    children: [
      (0, import_jsx_runtime.jsx)(Text, {
        id: `name`,
        label: `Broadcast name`,
        required: !0,
        value: c.name,
        max: l,
        error: c.errors.name,
        placeholder: `e.g. October Customer Campaign`,
        onChange: c.edit(`name`, c.setName),
        span: `half`,
      }),
      (0, import_jsx_runtime.jsx)(Text, {
        id: `description`,
        label: `Description`,
        value: c.description,
        max: _,
        error: c.errors.description,
        placeholder: `What this broadcast is for`,
        onChange: c.edit(`description`, c.setDescription),
        span: `half`,
      }),
    ],
  });
}
function AudienceFile({ f: c }) {
  let l = (0, import_react.useRef)(null),
    [_, T] = (0, import_react.useState)(!1);
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-bc__audience`,
    children: [
      c.file
        ? (0, import_jsx_runtime.jsx)(FileResult, { f: c })
        : (0, import_jsx_runtime.jsxs)(`div`, {
            className: `cnh-import__drop${_ ? ` is-dragging` : ``}${c.errors.file ? ` is-error` : ``}`,
            "data-error": c.errors.file ? `true` : void 0,
            onDragOver: (c) => {
              (c.preventDefault(), T(!0));
            },
            onDragLeave: () => T(!1),
            onDrop: (l) => {
              (l.preventDefault(), T(!1), c.pick(l.dataTransfer.files));
            },
            children: [
              (0, import_jsx_runtime.jsx)(Icon, {
                slug: `share`,
                size: 32,
                color: `var(--colorIconHighlightDefault)`,
              }),
              (0, import_jsx_runtime.jsx)(`p`, {
                className: `cnh-import__drop-title`,
                children: BROADCAST_COPY.dropTitle,
              }),
              (0, import_jsx_runtime.jsx)(`p`, {
                className: `cnh-import__drop-hint`,
                children: BROADCAST_COPY.dropHint,
              }),
              (0, import_jsx_runtime.jsx)(OutlineButton$1, {
                label: BROADCAST_COPY.browse,
                height: `36px`,
                onClick: () => l.current?.click(),
              }),
            ],
          }),
      (0, import_jsx_runtime.jsx)(`input`, {
        ref: l,
        type: `file`,
        accept: `.csv,.xlsx,text/csv`,
        hidden: !0,
        onChange: (l) => {
          (c.pick(l.target.files), (l.target.value = ``));
        },
      }),
      c.errors.file &&
        (0, import_jsx_runtime.jsx)(InlineMessage, {
          appearance: `negative`,
          size: `s`,
          text: c.errors.file,
        }),
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-bc__samples`,
        children: [
          (0, import_jsx_runtime.jsxs)(`a`, {
            className: `cnh-bc__link`,
            href: `/samples/audience-cis.csv`,
            download: !0,
            children: [
              (0, import_jsx_runtime.jsx)(Icon, {
                slug: `download`,
                size: 16,
                color: `currentColor`,
              }),
              `Sample file · CIS`,
            ],
          }),
          (0, import_jsx_runtime.jsxs)(`a`, {
            className: `cnh-bc__link`,
            href: `/samples/audience-direct.csv`,
            download: !0,
            children: [
              (0, import_jsx_runtime.jsx)(Icon, {
                slug: `download`,
                size: 16,
                color: `currentColor`,
              }),
              `Sample file · Direct recipient`,
            ],
          }),
        ],
      }),
    ],
  });
}
function FileResult({ f: c }) {
  let l = c.file,
    _ = c.read && !c.read.ok,
    T = c.audience !== null,
    E = c.check ? c.check.rows.filter((c) => c.errors.length) : [];
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-bc__file-block`,
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-import__file cnh-bc__file${_ ? ` is-error` : ``}`,
        children: [
          (0, import_jsx_runtime.jsx)(Icon, {
            slug: `documents`,
            size: 24,
            color: _
              ? `var(--colorIconNegativeDefault)`
              : `var(--colorIconSecondaryDefault)`,
          }),
          (0, import_jsx_runtime.jsx)(`p`, {
            className: `cnh-import__file-name`,
            title: l.name,
            children: l.name,
          }),
          (0, import_jsx_runtime.jsx)(`p`, {
            className: `cnh-import__file-meta`,
            children: c.read
              ? c.read.ok
                ? `${sizeLabel(l.size)} · ${n$1(c.read.audience.rows.length)} rows`
                : c.read.message
              : BROADCAST_COPY.checking,
          }),
          T &&
            (0, import_jsx_runtime.jsxs)(`span`, {
              className: `cnh-bc__validated`,
              children: [
                (0, import_jsx_runtime.jsx)(Icon, {
                  slug: `tick-circle`,
                  size: 16,
                  color: `var(--colorIconPositiveDefault)`,
                }),
                BROADCAST_COPY.validated,
              ],
            }),
          (0, import_jsx_runtime.jsx)(IconButton, {
            size: `16`,
            icon: (0, import_jsx_runtime.jsx)(Icon, {
              slug: `close`,
              size: 16,
              color: `currentColor`,
            }),
            "aria-label": `Remove ${l.name}`,
            onClick: c.clearFile,
          }),
        ],
      }),
      c.checking &&
        (0, import_jsx_runtime.jsx)(`div`, {
          className: `cnh-bc__checking`,
          children: (0, import_jsx_runtime.jsx)(SpinnerLoader, {
            size: `M`,
            appearance: `brand`,
          }),
        }),
      c.audience && (0, import_jsx_runtime.jsx)(Preview, { f: c }),
      c.check &&
        (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
          children: [
            (0, import_jsx_runtime.jsxs)(`p`, {
              className: `cnh-import__summary-text`,
              children: [
                BROADCAST_COPY.rowsSummary(c.check.rows.length, c.check.valid),
                c.check.invalid > 0 &&
                  (0, import_jsx_runtime.jsxs)(`span`, {
                    className: `cnh-import__summary-errors`,
                    children: [
                      ` · `,
                      BROADCAST_COPY.invalidCount(c.check.invalid),
                    ],
                  }),
                (0, import_jsx_runtime.jsxs)(`span`, {
                  className: `cnh-bc__by`,
                  children: [` · by `, c.column],
                }),
              ],
            }),
            c.check.invalid > 0 &&
              (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
                children: [
                  (0, import_jsx_runtime.jsx)(`p`, {
                    className: `cnh-bc__note`,
                    children: BROADCAST_COPY.invalidNote,
                  }),
                  (0, import_jsx_runtime.jsxs)(`table`, {
                    className: `cnh-bc__errors`,
                    children: [
                      (0, import_jsx_runtime.jsx)(`thead`, {
                        children: (0, import_jsx_runtime.jsxs)(`tr`, {
                          children: [
                            (0, import_jsx_runtime.jsx)(`th`, {
                              children: `Row`,
                            }),
                            (0, import_jsx_runtime.jsx)(`th`, {
                              children: c.column,
                            }),
                            (0, import_jsx_runtime.jsx)(`th`, {
                              children: `Problem`,
                            }),
                          ],
                        }),
                      }),
                      (0, import_jsx_runtime.jsx)(`tbody`, {
                        children: E.map((c) =>
                          (0, import_jsx_runtime.jsxs)(
                            `tr`,
                            {
                              children: [
                                (0, import_jsx_runtime.jsx)(`td`, {
                                  children: c.line,
                                }),
                                (0, import_jsx_runtime.jsx)(`td`, {
                                  children: c.id || `–`,
                                }),
                                (0, import_jsx_runtime.jsx)(`td`, {
                                  children: c.errors.join(` · `),
                                }),
                              ],
                            },
                            c.line,
                          ),
                        ),
                      }),
                    ],
                  }),
                ],
              }),
          ],
        }),
    ],
  });
}
function Preview({ f: c }) {
  let l = c.audience;
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-bc__preview`,
    children: [
      (0, import_jsx_runtime.jsx)(`span`, {
        className: `cnh-bc__label`,
        children: BROADCAST_COPY.previewTitle,
      }),
      (0, import_jsx_runtime.jsx)(`div`, {
        className: `cnh-bc__preview-scroll`,
        children: (0, import_jsx_runtime.jsxs)(`table`, {
          className: `cnh-bc__errors cnh-bc__preview-table`,
          children: [
            (0, import_jsx_runtime.jsx)(`thead`, {
              children: (0, import_jsx_runtime.jsx)(`tr`, {
                children: l.headers.map((l) =>
                  (0, import_jsx_runtime.jsx)(
                    `th`,
                    {
                      className: l === c.column ? `is-id` : void 0,
                      children: l,
                    },
                    l,
                  ),
                ),
              }),
            }),
            (0, import_jsx_runtime.jsx)(`tbody`, {
              children: l.rows
                .slice(0, 5)
                .map((_, T) =>
                  (0, import_jsx_runtime.jsx)(
                    `tr`,
                    {
                      children: l.headers.map((l, T) =>
                        (0, import_jsx_runtime.jsx)(
                          `td`,
                          {
                            className: l === c.column ? `is-id` : void 0,
                            children: _[T] ?? ``,
                          },
                          l,
                        ),
                      ),
                    },
                    T,
                  ),
                ),
            }),
          ],
        }),
      }),
    ],
  });
}
function RecipientType({ f: c }) {
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-bc__field-block`,
    children: [
      (0, import_jsx_runtime.jsx)(`span`, {
        className: `cnh-bc__label`,
        children: `Recipient type*`,
      }),
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-bc__modes`,
        role: `radiogroup`,
        "aria-label": `Recipient type`,
        children: [
          (0, import_jsx_runtime.jsx)(ModeOption, {
            name: `recipient-type`,
            on: c.recipientType === `cis`,
            label: `CIS`,
            description: `Send to customers using CIS ID from file`,
            onSelect: () => c.setRecipientType(`cis`),
          }),
          (0, import_jsx_runtime.jsx)(ModeOption, {
            name: `recipient-type`,
            on: c.recipientType === `direct`,
            label: `Direct recipient`,
            description: `Send to phone / email from file · Email or SMS only`,
            onSelect: () => c.setRecipientType(`direct`),
          }),
        ],
      }),
    ],
  });
}
function ColumnSelect({ f: c }) {
  let l = c.kind ? `${ID_LABEL[c.kind]} column` : `Recipient column`,
    _ = !c.audience || !c.kind,
    T = c.audience
      ? c.kind
        ? `Select the column that contains ${ID_LABEL[c.kind].toLowerCase().replace(`cis id`, `CIS ID`)}`
        : `Choose Email or SMS first`
      : `Upload the file first`;
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-form__field cnh-bc__column-select`,
    "data-error": c.errors.column ? `true` : void 0,
    children: [
      (0, import_jsx_runtime.jsx)(Select, {
        label: l,
        labelPosition: `outside`,
        isRequired: !0,
        "aria-label": l,
        options: (c.audience?.headers ?? []).map((c) => ({
          value: c,
          label: c,
        })),
        multiple: !1,
        disabled: _,
        MenuProps: SELECT_MENU_PROPS,
        error: !!c.errors.column,
        hasHint: !0,
        hint: c.errors.column ?? T,
        value: c.column,
        onChange: (l) => {
          (c.setColumn(l), c.clear(`column`, `file`));
        },
      }),
      !c.column &&
        (0, import_jsx_runtime.jsx)(`span`, {
          className: `cnh-form__select-placeholder`,
          children: `Select column`,
        }),
    ],
  });
}
function ChannelPicker({ f: c }) {
  let l = c.recipientType === `direct`;
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-bc__field-block`,
    "data-error": c.errors.channels ? `true` : void 0,
    children: [
      (0, import_jsx_runtime.jsx)(`span`, {
        className: `cnh-bc__label`,
        children: `Channels*`,
      }),
      (0, import_jsx_runtime.jsx)(`div`, {
        className: `cnh-bc__channel-picks`,
        role: l ? `radiogroup` : `group`,
        "aria-label": `Channels`,
        children: c.offered.map((_) => {
          let T = (0, import_jsx_runtime.jsxs)(`span`, {
            className: `cnh-bc__channel-pick`,
            children: [
              (0, import_jsx_runtime.jsx)(Icon, {
                slug: CHANNEL_ICON[_],
                size: 16,
                color: `var(--colorIconSecondaryDefault)`,
              }),
              _,
            ],
          });
          return l
            ? (0, import_jsx_runtime.jsx)(
                RadioButton,
                {
                  name: `direct-channel`,
                  label: T,
                  isSelected: c.channels.includes(_),
                  onChange: () => c.chooseDirect(_),
                  inputProps: { "aria-label": _ },
                },
                _,
              )
            : (0, import_jsx_runtime.jsx)(
                Checkbox,
                {
                  label: T,
                  selection: c.channels.includes(_) ? `checked` : `none`,
                  onChange: (l) => c.toggleChannel(_, l === `checked`),
                  accessibilityProps: { "aria-label": _ },
                },
                _,
              );
        }),
      }),
      c.errors.channels &&
        (0, import_jsx_runtime.jsx)(InlineMessage, {
          appearance: `negative`,
          size: `xs`,
          text: c.errors.channels,
        }),
    ],
  });
}
function ChannelCards({ f: c, focus: l }) {
  return (0, import_jsx_runtime.jsx)(`div`, {
    className: `cnh-bc__channel-row cnh-bc__channel-row--${c.offered.length}`,
    onFocusCapture: (_) => {
      let T = _.target,
        E = T.closest(`[data-field]`)?.getAttribute(`data-field`);
      E && E in c.content && (l.current = { key: E, el: T });
    },
    children: c.offered.map((l) => {
      let _ = c.channels.includes(l);
      return (0, import_jsx_runtime.jsxs)(
        CardSurface,
        {
          type: `default`,
          tabIndex: -1,
          width: `100%`,
          padding: `var(--floatGenericSpace6)`,
          borderRadius: `var(--floatRadius2)`,
          backgroundColor: `var(--colorSurfacePrimaryDefault)`,
          className: `cnh-form__card`,
          children: [
            (0, import_jsx_runtime.jsxs)(`div`, {
              className: `cnh-form__card-head`,
              children: [
                (0, import_jsx_runtime.jsx)(Icon, {
                  slug: CHANNEL_ICON[l],
                  size: 24,
                  color: _
                    ? `var(--colorIconHighlightDefault)`
                    : `var(--colorIconDisabledDefault)`,
                }),
                (0, import_jsx_runtime.jsxs)(`div`, {
                  className: `cnh-form__card-text`,
                  children: [
                    (0, import_jsx_runtime.jsx)(`span`, {
                      className: `cnh-form__card-title`,
                      children: l,
                    }),
                    !_ &&
                      (0, import_jsx_runtime.jsx)(`span`, {
                        className: `cnh-bc__note`,
                        children: `Not selected in step 3`,
                      }),
                  ],
                }),
              ],
            }),
            (0, import_jsx_runtime.jsxs)(`div`, {
              className: `cnh-form__rows--24`,
              children: [
                l === `Push notification` &&
                  (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
                    children: [
                      (0, import_jsx_runtime.jsx)(Text, {
                        id: `pushTitle`,
                        label: `Push title`,
                        required: !0,
                        disabled: !_,
                        value: c.content.pushTitle,
                        max: 100,
                        error: c.errors.pushTitle,
                        onChange: c.setC(`pushTitle`),
                      }),
                      (0, import_jsx_runtime.jsx)(Text, {
                        id: `pushBody`,
                        label: `Push message`,
                        required: !0,
                        multiline: !0,
                        disabled: !_,
                        value: c.content.pushBody,
                        max: 250,
                        error: c.errors.pushBody,
                        onChange: c.setC(`pushBody`),
                      }),
                    ],
                  }),
                l === `Email` &&
                  (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
                    children: [
                      (0, import_jsx_runtime.jsx)(Text, {
                        id: `emailSubject`,
                        label: `Email subject`,
                        required: !0,
                        disabled: !_,
                        value: c.content.emailSubject,
                        max: 100,
                        error: c.errors.emailSubject,
                        onChange: c.setC(`emailSubject`),
                      }),
                      (0, import_jsx_runtime.jsx)(Text, {
                        id: `emailBody`,
                        label: `Email body`,
                        required: !0,
                        multiline: !0,
                        disabled: !_,
                        value: c.content.emailBody,
                        max: 1e3,
                        error: c.errors.emailBody,
                        onChange: c.setC(`emailBody`),
                      }),
                    ],
                  }),
                l === `SMS` &&
                  (0, import_jsx_runtime.jsx)(SmsField, {
                    disabled: !_,
                    value: c.content.smsMessage,
                    error: c.errors.smsMessage,
                    onChange: c.setC(`smsMessage`),
                  }),
              ],
            }),
          ],
        },
        l,
      );
    }),
  });
}
function FieldChips({ f: c, focus: l }) {
  let [_, T] = (0, import_react.useState)(!1);
  if (!c.fields.length)
    return (0, import_jsx_runtime.jsx)(`p`, {
      className: `cnh-bc__note`,
      children: `Available fields appear here once the audience file is uploaded.`,
    });
  let E = (_) => {
    let E = l.current;
    if (!E || E.el.disabled) return T(!0);
    T(!1);
    let D = E.el.selectionStart ?? E.el.value.length,
      O = E.el.selectionEnd ?? E.el.value.length;
    (c.setC(E.key)(E.el.value.slice(0, D) + _ + E.el.value.slice(O)),
      requestAnimationFrame(() => {
        (E.el.focus(), E.el.setSelectionRange(D + _.length, D + _.length));
      }));
  };
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-bc__fields`,
    children: [
      (0, import_jsx_runtime.jsx)(`span`, {
        className: `cnh-bc__label`,
        children: `Available fields`,
      }),
      (0, import_jsx_runtime.jsx)(`div`, {
        className: `cnh-bc__field-chips`,
        children: c.fields.map((c) =>
          (0, import_jsx_runtime.jsx)(
            `span`,
            {
              onMouseDown: (c) => c.preventDefault(),
              children: (0, import_jsx_runtime.jsx)(PillChip, {
                label: c.column,
                appearance: `highlight`,
                height: `32px`,
                onClick: () => E(c.token),
                accessibility: { ariaLabel: `Insert ${c.token}` },
              }),
            },
            c.column,
          ),
        ),
      }),
      _ &&
        (0, import_jsx_runtime.jsx)(InlineMessage, {
          appearance: `negative`,
          size: `xs`,
          text: BROADCAST_COPY.pickField,
        }),
    ],
  });
}
function Delivery({ f: c }) {
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-bc__rows`,
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-bc__modes`,
        role: `radiogroup`,
        "aria-label": `When to send`,
        children: [
          (0, import_jsx_runtime.jsx)(ModeOption, {
            name: `broadcast-mode`,
            on: c.mode === `now`,
            label: `Send as soon as possible`,
            description: `Start sending after you submit this broadcast.`,
            onSelect: () => {
              (c.setMode(`now`), c.clear(`startDate`, `startTime`));
            },
          }),
          (0, import_jsx_runtime.jsx)(ModeOption, {
            name: `broadcast-mode`,
            on: c.mode === `schedule`,
            label: `Schedule delivery`,
            description: `Choose a date and time to start sending.`,
            onSelect: () => c.setMode(`schedule`),
          }),
        ],
      }),
      c.mode === `schedule` &&
        (0, import_jsx_runtime.jsxs)(`div`, {
          className: `cnh-form__row`,
          children: [
            (0, import_jsx_runtime.jsx)(DateField, {
              id: `startDate`,
              label: `Start date`,
              value: c.startDate,
              error: c.errors.startDate,
              onChange: (l) => {
                (c.setStartDate(l), c.clear(`startDate`));
              },
            }),
            (0, import_jsx_runtime.jsx)(TimeField, {
              label: `Start time`,
              required: !0,
              value: c.startTime,
              error: c.errors.startTime,
              onChange: (l) => {
                (c.setStartTime(l), c.clear(`startTime`, `startDate`));
              },
            }),
          ],
        }),
      (0, import_jsx_runtime.jsx)(Outlook, { f: c }),
    ],
  });
}
function Outlook({ f: c }) {
  return !c.start || !c.first
    ? null
    : (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-bc__tip`,
        children: [
          (0, import_jsx_runtime.jsx)(Icon, {
            slug: `time`,
            size: 24,
            color: `var(--colorIconHighlightDefault)`,
          }),
          (0, import_jsx_runtime.jsxs)(`span`, {
            children: [
              c.waits
                ? `${c.mode === `now` ? `Now` : `The start`} is inside the quiet period. Sending starts at ${fmtDateTime(c.first)}.`
                : c.mode === `now`
                  ? `Sending starts right after you submit.`
                  : `Sending starts at ${fmtDateTime(c.start)}.`,
              c.dnd.enabled &&
                ` Sending pauses during the quiet period and resumes after it.`,
            ],
          }),
        ],
      });
}
function DndPanel({ f: c, layout: l = `row` }) {
  let _ = c.dnd;
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-bc__dnd cnh-bc__dnd--${l}`,
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-bc__dnd-switch`,
        children: [
          (0, import_jsx_runtime.jsx)(ToggleSwitch, {
            isToggled: _.enabled,
            ariaLabel: `Do Not Disturb`,
            onToggle: (l) => c.setDndPart({ enabled: l }),
          }),
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `cnh-bc__mode-text`,
            children: [
              (0, import_jsx_runtime.jsx)(`span`, {
                className: `cnh-bc__channel-label`,
                children: _.enabled ? `Enabled` : `Disabled`,
              }),
              (0, import_jsx_runtime.jsx)(`span`, {
                className: `cnh-bc__note`,
                children: `Prevent sending messages during quiet hours.`,
              }),
            ],
          }),
        ],
      }),
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-bc__dnd-fields${_.enabled ? `` : ` is-off`}`,
        children: [
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `cnh-bc__field-block`,
            "data-error": c.errors.dndDays ? `true` : void 0,
            children: [
              (0, import_jsx_runtime.jsx)(`span`, {
                className: `cnh-bc__field-label`,
                children: `Weekdays`,
              }),
              (0, import_jsx_runtime.jsx)(`div`, {
                className: `cnh-bc__days`,
                children: DAYS.map(({ day: l, label: T }) =>
                  (0, import_jsx_runtime.jsx)(
                    Checkbox,
                    {
                      label: T,
                      accessibilityProps: {
                        "aria-label": `Do Not Disturb on ${T}`,
                      },
                      disabled: !_.enabled,
                      selection: _.days.includes(l) ? `checked` : `none`,
                      onChange: (T) =>
                        c.setDndPart({
                          days:
                            T === `checked`
                              ? [..._.days, l]
                              : _.days.filter((c) => c !== l),
                        }),
                    },
                    l,
                  ),
                ),
              }),
              c.errors.dndDays &&
                (0, import_jsx_runtime.jsx)(InlineMessage, {
                  appearance: `negative`,
                  size: `xs`,
                  text: c.errors.dndDays,
                }),
            ],
          }),
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `cnh-bc__field-block`,
            "data-error": c.errors.dndTime ? `true` : void 0,
            children: [
              (0, import_jsx_runtime.jsxs)(`div`, {
                className: `cnh-bc__time-row`,
                children: [
                  (0, import_jsx_runtime.jsx)(TimeField, {
                    label: `Quiet period from`,
                    value: _.from,
                    disabled: !_.enabled,
                    onChange: (l) => c.setDndPart({ from: l }),
                  }),
                  (0, import_jsx_runtime.jsx)(`span`, {
                    className: `cnh-bc__to`,
                    children: `to`,
                  }),
                  (0, import_jsx_runtime.jsx)(TimeField, {
                    label: ` `,
                    ariaLabel: `Quiet period to`,
                    value: _.to,
                    disabled: !_.enabled,
                    onChange: (l) => c.setDndPart({ to: l }),
                  }),
                ],
              }),
              c.errors.dndTime &&
                (0, import_jsx_runtime.jsx)(InlineMessage, {
                  appearance: `negative`,
                  size: `xs`,
                  text: c.errors.dndTime,
                }),
            ],
          }),
          (0, import_jsx_runtime.jsx)(`div`, {
            className: `cnh-form__field cnh-bc__zone`,
            children: (0, import_jsx_runtime.jsx)(Select, {
              label: `Time zone`,
              labelPosition: `outside`,
              "aria-label": `Time zone`,
              options: TIME_ZONES.map((c) => ({
                value: c.value,
                label: c.label,
              })),
              multiple: !1,
              disabled: !_.enabled,
              MenuProps: SELECT_MENU_PROPS,
              value: _.timeZone,
              onChange: (l) => c.setDndPart({ timeZone: l }),
            }),
          }),
        ],
      }),
    ],
  });
}
function Dialogs({ f: c, onBack: l }) {
  return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
    children: [
      c.creating &&
        (0, import_jsx_runtime.jsx)(`div`, {
          className: `cnh-bc__overlay`,
          role: `status`,
          "aria-live": `polite`,
          children: (0, import_jsx_runtime.jsx)(SpinnerLoader, {
            size: `L`,
            appearance: `brand`,
          }),
        }),
      (0, import_jsx_runtime.jsx)(DialogPopup, {
        open: c.leaveOpen,
        title: `You are about to leave this page`,
        width: `600px`,
        className: `cnh-form__dialog cnh-form__dialog--body-m`,
        titlePadding: `16px 16px 0`,
        contentPadding: `16px`,
        actionsPadding: `8px 16px 16px`,
        onClose: () => c.setLeaveOpen(!1),
        actions: [
          {
            label: `Leave`,
            variant: `outline`,
            onClick: () => {
              (c.setLeaveOpen(!1), l());
            },
          },
          {
            label: `Stay`,
            variant: `filled`,
            onClick: () => c.setLeaveOpen(!1),
          },
        ],
        children: `The changes you made will not be saved`,
      }),
      (0, import_jsx_runtime.jsx)(DialogPopup, {
        open: c.confirmOpen,
        title: BROADCAST_COPY.submitTitle,
        width: `600px`,
        className: `cnh-form__dialog cnh-form__dialog--body-m`,
        titlePadding: `16px 16px 0`,
        contentPadding: `16px`,
        actionsPadding: `8px 16px 16px`,
        onClose: () => c.setConfirmOpen(!1),
        actions: [
          {
            label: `Cancel`,
            variant: `outline`,
            onClick: () => c.setConfirmOpen(!1),
          },
          { label: `Submit`, variant: `filled`, onClick: c.create },
        ],
        children: (0, import_jsx_runtime.jsxs)(`dl`, {
          className: `cnh-bc__summary`,
          children: [
            (0, import_jsx_runtime.jsx)(`dt`, { children: `Broadcast` }),
            (0, import_jsx_runtime.jsx)(`dd`, { children: c.name }),
            (0, import_jsx_runtime.jsx)(`dt`, { children: `Recipients` }),
            (0, import_jsx_runtime.jsxs)(`dd`, {
              children: [
                n$1(c.check?.valid ?? 0),
                ` from `,
                c.file?.name,
                ` · by `,
                c.column,
              ],
            }),
            (0, import_jsx_runtime.jsx)(`dt`, { children: `Channel` }),
            (0, import_jsx_runtime.jsx)(`dd`, {
              children: CHANNELS.filter((l) => c.channels.includes(l)).join(
                `, `,
              ),
            }),
            (0, import_jsx_runtime.jsx)(`dt`, { children: `Delivery` }),
            (0, import_jsx_runtime.jsx)(`dd`, {
              children:
                c.mode === `now`
                  ? `As soon as possible`
                  : c.start && fmtDateTime(c.start),
            }),
            (0, import_jsx_runtime.jsx)(`dt`, { children: `Do Not Disturb` }),
            (0, import_jsx_runtime.jsx)(`dd`, { children: fmtDnd(c.dnd) }),
          ],
        }),
      }),
      (0, import_jsx_runtime.jsx)(DialogPopup, {
        open: c.failed,
        title: BROADCAST_COPY.submitFailTitle,
        width: `600px`,
        className: `cnh-form__dialog cnh-form__dialog--body-l`,
        titlePadding: `16px 16px 0`,
        contentPadding: `16px`,
        actionsPadding: `8px 16px 16px`,
        onClose: () => c.setFailed(!1),
        actions: [
          {
            label: `Close`,
            variant: `outline`,
            onClick: () => c.setFailed(!1),
          },
          {
            label: `Try again`,
            variant: `filled`,
            onClick: () => {
              (c.setFailed(!1), c.create());
            },
          },
        ],
        children: `Please try again`,
      }),
    ],
  });
}
function Text({
  id: c,
  label: l,
  value: _,
  onChange: T,
  max: E,
  error: D,
  placeholder: O,
  hint: A,
  required: j,
  multiline: M,
  disabled: N,
  span: F = `full`,
}) {
  return (0, import_jsx_runtime.jsx)(`div`, {
    className: `cnh-form__span--${F}`,
    "data-field": c,
    "data-error": D ? `true` : void 0,
    children: (0, import_jsx_runtime.jsxs)(`div`, {
      className: `cnh-form__field`,
      children: [
        M
          ? (0, import_jsx_runtime.jsx)(TextArea, {
              id: c,
              name: c,
              "aria-label": l,
              label: j ? `${l}*` : l,
              value: _,
              placeholder: O,
              disabled: N,
              error: !!D,
              hasMessage: !1,
              hasCounter: !1,
              hasHint: !1,
              height: `156px`,
              width: `100%`,
              onChange: T,
            })
          : (0, import_jsx_runtime.jsx)(TextField, {
              id: c,
              name: c,
              label: l,
              labelPosition: `outside`,
              required: j,
              value: _,
              placeholder: O,
              disabled: N,
              error: !!D,
              hasMessage: !1,
              hasCounter: !1,
              onChange: T,
            }),
        (0, import_jsx_runtime.jsxs)(`div`, {
          className: `cnh-form__counter`,
          children: [
            D
              ? (0, import_jsx_runtime.jsx)(InlineMessage, {
                  text: D,
                  appearance: `negative`,
                  size: `xs`,
                })
              : (0, import_jsx_runtime.jsx)(`span`, {
                  className: `cnh-form__hint`,
                  children: A ?? ``,
                }),
            E
              ? (0, import_jsx_runtime.jsxs)(`span`, {
                  children: [_.length, `/`, E],
                })
              : null,
          ],
        }),
      ],
    }),
  });
}
function SmsField({ value: c, error: l, onChange: _, disabled: T }) {
  let E = smsInfo(c);
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-form__field`,
    "data-field": `smsMessage`,
    "data-error": l ? `true` : void 0,
    children: [
      (0, import_jsx_runtime.jsx)(TextArea, {
        id: `smsMessage`,
        name: `smsMessage`,
        "aria-label": `SMS message`,
        label: `SMS message*`,
        value: c,
        disabled: T,
        error: !!l,
        hasMessage: !1,
        hasCounter: !1,
        hasHint: !1,
        height: `156px`,
        width: `100%`,
        onChange: _,
      }),
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `cnh-form__counter`,
        children: [
          l
            ? (0, import_jsx_runtime.jsx)(InlineMessage, {
                text: l,
                appearance: `negative`,
                size: `xs`,
              })
            : (0, import_jsx_runtime.jsx)(`span`, {
                className: `cnh-form__hint`,
                children: E.unicode
                  ? `Thai · 70 per SMS`
                  : `English · 160 per SMS`,
              }),
          (0, import_jsx_runtime.jsxs)(`span`, {
            children: [E.length, ` characters · `, E.segments, ` SMS`],
          }),
        ],
      }),
    ],
  });
}
function ModeOption({ name: c, on: l, label: _, description: T, onSelect: E }) {
  return (0, import_jsx_runtime.jsxs)(`label`, {
    className: `cnh-bc__mode${l ? ` is-on` : ``}`,
    children: [
      (0, import_jsx_runtime.jsx)(RadioButton, {
        name: c,
        isSelected: l,
        onChange: E,
        inputProps: { "aria-label": _ },
      }),
      (0, import_jsx_runtime.jsxs)(`span`, {
        className: `cnh-bc__mode-text`,
        children: [
          (0, import_jsx_runtime.jsx)(`span`, {
            className: `cnh-bc__channel-label`,
            children: _,
          }),
          (0, import_jsx_runtime.jsx)(`span`, {
            className: `cnh-bc__note`,
            children: T,
          }),
        ],
      }),
    ],
  });
}
function DateField({
  id: c,
  label: l,
  value: _,
  onChange: T,
  error: E,
  hint: D,
}) {
  return (0, import_jsx_runtime.jsx)(`div`, {
    className: `cnh-form__span--half`,
    "data-error": E ? `true` : void 0,
    children: (0, import_jsx_runtime.jsxs)(`div`, {
      className: `cnh-form__field cnh-bc__date`,
      id: `${c}-field`,
      children: [
        (0, import_jsx_runtime.jsxs)(`span`, {
          className: `cnh-bc__field-label`,
          children: [l, `*`],
        }),
        (0, import_jsx_runtime.jsx)(DatePicker, {
          label: ``,
          value: _,
          onChange: T,
          disablePast: !0,
          format: `DD/MM/YYYY`,
          accessibility: { ariaLabel: l },
        }),
        (0, import_jsx_runtime.jsx)(`div`, {
          className: `cnh-form__counter`,
          children: E
            ? (0, import_jsx_runtime.jsx)(InlineMessage, {
                text: E,
                appearance: `negative`,
                size: `xs`,
              })
            : (0, import_jsx_runtime.jsx)(`span`, {
                className: `cnh-form__hint`,
                children: D ?? ``,
              }),
        }),
      ],
    }),
  });
}
function TimeField({
  label: c,
  value: l,
  onChange: _,
  error: T,
  ariaLabel: E,
  required: D,
  disabled: O,
}) {
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: `cnh-form__field cnh-bc__time`,
    "data-error": T ? `true` : void 0,
    children: [
      (0, import_jsx_runtime.jsx)(Select, {
        label: c,
        labelPosition: `outside`,
        isRequired: D,
        "aria-label": E ?? c,
        options: TIMES.map((c) => ({ value: c, label: c })),
        multiple: !1,
        disabled: O,
        MenuProps: {
          ...SELECT_MENU_PROPS,
          classes: { paper: `cnh-form__menu cnh-bc__time-menu` },
        },
        error: !!T,
        hasHint: !!T,
        hint: T,
        value: l,
        onChange: (c) => _(c),
      }),
      !l &&
        (0, import_jsx_runtime.jsx)(`span`, {
          className: `cnh-form__select-placeholder`,
          children: `HH:mm`,
        }),
    ],
  });
}
function BroadcastWizard({
  onBack: c,
  onCreate: l,
  failNext: _,
  preset: T,
  initial: E,
}) {
  let D = useBroadcastForm({ onCreate: l, failNext: _, preset: T, initial: E }),
    O = (0, import_react.useRef)(null),
    A = (0, import_react.useRef)(null);
  return (
    useUniqueSelectNames([
      D.mode,
      D.channels.length,
      D.recipientType,
      D.fields.length,
    ]),
    (0, import_jsx_runtime.jsxs)(`div`, {
      className: `cnh-form cnh-bc`,
      children: [
        (0, import_jsx_runtime.jsxs)(`div`, {
          className: `cnh-form__header`,
          children: [
            (0, import_jsx_runtime.jsx)(`button`, {
              type: `button`,
              "aria-label": `Back`,
              onClick: () => (D.dirty ? D.setLeaveOpen(!0) : c()),
              className: `cnh-form__back`,
              children: (0, import_jsx_runtime.jsx)(Icon, {
                slug: `chevron-left`,
                size: 24,
              }),
            }),
            (0, import_jsx_runtime.jsx)(`h1`, {
              className: `cnh-form__title`,
              children: D.editing ? BROADCAST_COPY.edit : BROADCAST_COPY.create,
            }),
          ],
        }),
        (0, import_jsx_runtime.jsx)(`div`, {
          ref: O,
          className: `cnh-form__scroll`,
          children: (0, import_jsx_runtime.jsx)(`div`, {
            className: `cnh-form__page`,
            children: (0, import_jsx_runtime.jsxs)(`div`, {
              className: `cnh-form__column`,
              children: [
                (0, import_jsx_runtime.jsx)(Section, {
                  title: `Step 1: Basic information`,
                  children: (0, import_jsx_runtime.jsx)(BasicInfo, {
                    f: D,
                    nameMax: 100,
                    descriptionMax: 250,
                  }),
                }),
                (0, import_jsx_runtime.jsx)(Section, {
                  title: `Step 2: Audience file`,
                  children: (0, import_jsx_runtime.jsx)(AudienceFile, { f: D }),
                }),
                (0, import_jsx_runtime.jsx)(Section, {
                  title: `Step 3: Recipient mapping & channels`,
                  children: (0, import_jsx_runtime.jsxs)(`div`, {
                    className: `cnh-bc__mapping`,
                    children: [
                      (0, import_jsx_runtime.jsx)(RecipientType, { f: D }),
                      (0, import_jsx_runtime.jsx)(ColumnSelect, { f: D }),
                      (0, import_jsx_runtime.jsx)(ChannelPicker, { f: D }),
                    ],
                  }),
                }),
                (0, import_jsx_runtime.jsxs)(Section, {
                  title: `Step 4: Manual content`,
                  bare: !0,
                  children: [
                    (0, import_jsx_runtime.jsx)(FieldChips, { f: D, focus: A }),
                    (0, import_jsx_runtime.jsx)(ChannelCards, {
                      f: D,
                      focus: A,
                    }),
                  ],
                }),
                (0, import_jsx_runtime.jsx)(Section, {
                  title: `Step 5: Delivery`,
                  children: (0, import_jsx_runtime.jsx)(Delivery, { f: D }),
                }),
                (0, import_jsx_runtime.jsx)(Section, {
                  title: `Step 6: Do Not Disturb (DND)`,
                  children: (0, import_jsx_runtime.jsx)(DndPanel, { f: D }),
                }),
              ],
            }),
          }),
        }),
        (0, import_jsx_runtime.jsx)(`div`, {
          className: `cnh-form__footer`,
          children: (0, import_jsx_runtime.jsxs)(`div`, {
            className: `cnh-form__footer-row`,
            children: [
              (0, import_jsx_runtime.jsx)(OutlineButton$1, {
                label: `Save draft`,
                width: `177px`,
                onClick: () => D.saveDraft(O.current),
              }),
              (0, import_jsx_runtime.jsx)(Button, {
                label: `Submit`,
                width: `177px`,
                onClick: () => D.submit(O.current),
              }),
            ],
          }),
        }),
        (0, import_jsx_runtime.jsx)(Dialogs, { f: D, onBack: c }),
      ],
    })
  );
}
var n = (c) => c.toLocaleString(`en-US`),
  STATUS_LINE = {
    Draft: () =>
      `Not submitted yet. Nothing is sent until the broadcast is submitted.`,
    Scheduled: (c) =>
      `The first message goes at ${fmtDateTime(firstSend(new Date(c.start), c.dnd))}.`,
    Sending: () => `Messages are being sent.`,
    Paused: (c) => `Inside the quiet period. Sending resumes at ${c.dnd.to}.`,
    Completed: () => `Every recipient was sent a message.`,
  };
function BroadcastDrawer({ broadcast: c, onClose: l, onEdit: _ }) {
  let T = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    let c = document.activeElement;
    T.current?.focus();
    let _ = (c) => {
        if (c.key === `Escape`) return l();
        if (c.key !== `Tab` || !T.current) return;
        let _ = [
          ...T.current.querySelectorAll(
            `button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])`,
          ),
        ].filter((c) => c.offsetParent !== null);
        if (!_.length) return;
        let E = _[0],
          D = _[_.length - 1],
          O = document.activeElement;
        c.shiftKey && (O === E || O === T.current)
          ? (c.preventDefault(), D.focus())
          : !c.shiftKey && O === D && (c.preventDefault(), E.focus());
      },
      E = (c) => {
        T.current?.contains(c.target) || l();
      },
      D = setTimeout(() => document.addEventListener(`mousedown`, E), 0);
    return (
      addEventListener(`keydown`, _),
      () => {
        (clearTimeout(D),
          document.removeEventListener(`mousedown`, E),
          removeEventListener(`keydown`, _),
          c && document.contains(c) && c.focus());
      }
    );
  }, [l]);
  let E = Math.max(0, c.recipients - c.success - c.failed),
    D = c.content,
    O = c.status === `Draft`,
    A = [
      ...(O
        ? []
        : [
            {
              title: `Delivery result`,
              icon: `send`,
              rows: [
                [`Total recipients`, n(c.recipients)],
                [`Success`, n(c.success)],
                [`Failed`, n(c.failed)],
                [`Waiting to send`, n(E)],
              ],
              note: STATUS_LINE[c.status](c),
            },
          ]),
      {
        title: `Broadcast details`,
        icon: `calendar`,
        rows: [
          [`Description`, c.description],
          [`Audience file`, c.audienceFile],
          [
            `Recipient type`,
            `${c.recipientType === `cis` ? `CIS` : `Direct recipient`} · by ${c.recipientColumn}`,
          ],
          [
            `Broadcast start`,
            c.startMode === `now`
              ? `As soon as possible · ${fmtDateTime(new Date(c.start))}`
              : fmtDateTime(new Date(c.start)),
          ],
          [`Do Not Disturb`, fmtDnd(c.dnd)],
        ],
        note: O ? STATUS_LINE.Draft(c) : void 0,
      },
      ...(c.channels.includes(`Push notification`)
        ? [
            {
              title: `Push notification`,
              icon: `alert`,
              rows: [
                [`Push title`, D.pushTitle],
                [`Push message`, D.pushBody],
              ],
            },
          ]
        : []),
      ...(c.channels.includes(`Email`)
        ? [
            {
              title: `Email`,
              icon: `mail`,
              rows: [
                [`Email subject`, D.emailSubject],
                [`Email body`, D.emailBody],
              ],
            },
          ]
        : []),
      ...(c.channels.includes(`SMS`)
        ? [
            {
              title: `SMS`,
              icon: `message`,
              rows: [[`SMS message`, D.smsMessage]],
            },
          ]
        : []),
    ];
  return (0, import_jsx_runtime.jsxs)(`aside`, {
    ref: T,
    className: `tpl-drawer`,
    role: `dialog`,
    "aria-modal": `true`,
    "aria-label": c.name,
    tabIndex: -1,
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `tpl-drawer__header`,
        children: [
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `tpl-drawer__header-top`,
            children: [
              (0, import_jsx_runtime.jsxs)(`div`, {
                className: `tpl-drawer__titles`,
                children: [
                  (0, import_jsx_runtime.jsx)(`span`, {
                    className: `tpl-drawer__title`,
                    children: c.name,
                  }),
                  (0, import_jsx_runtime.jsxs)(`div`, {
                    className: `tpl-drawer__status`,
                    children: [
                      (0, import_jsx_runtime.jsx)(`span`, {
                        className: `tpl-drawer__status-label`,
                        children: `Status`,
                      }),
                      (0, import_jsx_runtime.jsx)(Badge, {
                        label: c.status,
                        type: STATUS_TONE[c.status],
                        size: `xs`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, import_jsx_runtime.jsx)(`button`, {
                type: `button`,
                "aria-label": `Close`,
                onClick: l,
                className: `tpl-drawer__close`,
                children: (0, import_jsx_runtime.jsx)(Icon, {
                  slug: `sidebar-collapse`,
                  size: 24,
                }),
              }),
            ],
          }),
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `tpl-drawer__meta`,
            children: [
              (0, import_jsx_runtime.jsx)(Meta, {
                icon: `user`,
                label: `Created by: ${c.createdBy}`,
              }),
              (0, import_jsx_runtime.jsx)(Meta, {
                icon: `transaction-history`,
                label: `Created: ${fmtDateTime(new Date(c.createdAt))}`,
              }),
            ],
          }),
        ],
      }),
      (0, import_jsx_runtime.jsx)(ScrollBar, {
        appearance: `thick`,
        orientation: `vertical`,
        width: `100%`,
        height: `100%`,
        className: `tpl-drawer__body-wrap`,
        children: (0, import_jsx_runtime.jsx)(`div`, {
          className: `tpl-drawer__body`,
          children: A.map((c, l) =>
            (0, import_jsx_runtime.jsxs)(
              `div`,
              {
                className: `tpl-drawer__section`,
                children: [
                  (0, import_jsx_runtime.jsx)(Divider, {
                    className: l === 0 ? `tpl-drawer__divider--blank` : void 0,
                  }),
                  (0, import_jsx_runtime.jsxs)(`div`, {
                    className: `tpl-drawer__section-head`,
                    children: [
                      (0, import_jsx_runtime.jsx)(Icon, {
                        slug: c.icon,
                        size: 24,
                      }),
                      (0, import_jsx_runtime.jsx)(`span`, {
                        className: `tpl-drawer__section-title`,
                        children: c.title,
                      }),
                    ],
                  }),
                  (0, import_jsx_runtime.jsx)(`div`, {
                    className: `tpl-drawer__rows`,
                    children: c.rows.map(([c, l]) =>
                      (0, import_jsx_runtime.jsxs)(
                        `div`,
                        {
                          className: `tpl-drawer__row`,
                          children: [
                            (0, import_jsx_runtime.jsx)(`span`, {
                              className: `tpl-drawer__row-label`,
                              children: c,
                            }),
                            (0, import_jsx_runtime.jsx)(`span`, {
                              className: `tpl-drawer__row-value cnh-bc__pre`,
                              children: l || `–`,
                            }),
                          ],
                        },
                        c,
                      ),
                    ),
                  }),
                  c.note &&
                    (0, import_jsx_runtime.jsxs)(`div`, {
                      className: `cnh-bc__tip`,
                      children: [
                        (0, import_jsx_runtime.jsx)(Icon, {
                          slug: `information`,
                          size: 24,
                          color: `var(--colorIconHighlightDefault)`,
                        }),
                        (0, import_jsx_runtime.jsx)(`span`, {
                          children: c.note,
                        }),
                      ],
                    }),
                ],
              },
              c.title,
            ),
          ),
        }),
      }),
      O &&
        (0, import_jsx_runtime.jsx)(`div`, {
          className: `tpl-drawer__footer`,
          children: (0, import_jsx_runtime.jsx)(Button, {
            label: `Edit`,
            appearance: `default`,
            height: `44px`,
            onClick: _,
          }),
        }),
    ],
  });
}
function Meta({ icon: c, label: l }) {
  return (0, import_jsx_runtime.jsxs)(`span`, {
    className: `tpl-drawer__meta-item`,
    children: [
      (0, import_jsx_runtime.jsx)(Icon, {
        slug: c,
        size: 16,
        color: `var(--colorIconTertiaryDefault)`,
      }),
      (0, import_jsx_runtime.jsx)(`span`, { children: l }),
    ],
  });
}
var NAV = [
  {
    label: `Customer Notification Hub`,
    items: [
      { id: `template-management`, label: `Notification management` },
      { id: `broadcast`, label: `Broadcast message` },
    ],
  },
];
function useHash() {
  let [c, l] = (0, import_react.useState)(location.hash);
  return (
    (0, import_react.useEffect)(() => {
      let c = () => l(location.hash);
      return (
        addEventListener(`hashchange`, c),
        () => removeEventListener(`hashchange`, c)
      );
    }, []),
    c
  );
}
var toValues = (c) => ({
    templateName: c.name,
    templateDescription: c.description,
    productName: c.productName,
    serviceCode: c.detail.serviceCode,
    notificationGroup: c.detail.notificationGroup,
    status: c.status,
    remark: c.detail.remark,
    pushTitleTh: c.detail.pushTitleTh,
    pushTitleEn: c.detail.pushTitleEn,
    pushBodyTh: c.detail.pushBodyTh,
    pushBodyEn: c.detail.pushBodyEn,
    pushDeeplink: c.detail.pushDeeplink,
    emailSubjectTh: c.detail.emailSubjectTh,
    emailSubjectEn: c.detail.emailSubjectEn,
    emailBodyTh: c.detail.emailBodyTh,
    emailBodyEn: c.detail.emailBodyEn,
    emailDisplayNameTh: c.detail.emailDisplayNameTh,
    emailDisplayNameEn: c.detail.emailDisplayNameEn,
    emailFromAddress: c.detail.emailFromAddress,
    emailTemplateName: c.detail.emailTemplateName,
    smsMessageTh: c.detail.smsMessageTh,
    smsMessageEn: c.detail.smsMessageEn,
  }),
  togglesOf = (c) => ({
    push: c.channels.includes(`Push notification`),
    email: c.channels.includes(`Email`),
    sms: c.channels.includes(`SMS`),
  }),
  stampsFor = (c) => {
    let l = String(c).padStart(4, `0`),
      _ = new Date(),
      T = String(_.getDate()).padStart(2, `0`),
      E = String(_.getMonth() + 1).padStart(2, `0`);
    return {
      running: l,
      ymd: `${_.getFullYear()}${E}${T}`,
      dmy: `${T} ${_.toLocaleString(`en-US`, { month: `short` })} ${_.getFullYear()}`,
    };
  },
  stampImported = (c, l) => {
    let { running: _, ymd: T, dmy: E } = stampsFor(l);
    return {
      ...c,
      id: `TPL-${_}`,
      detail: {
        ...c.detail,
        templateRefCode: `${T}${_}`,
        createdBy: `Panisa R.`,
        updatedBy: `Panisa R.`,
        lastUpdated: E,
      },
    };
  },
  fromValues = (c, l, _, T) => {
    let { running: E, ymd: D, dmy: O } = stampsFor(T),
      A = [l.push, l.email, l.sms];
    return {
      id: `TPL-${E}`,
      name: c.templateName ?? ``,
      description: c.templateDescription ?? ``,
      productName: c.productName ?? ``,
      serviceCode: `NACVS`,
      channels: CHANNELS.filter((c, l) => A[l]),
      status: _,
      detail: {
        templateRefCode: `${D}${E}`,
        serviceCode: c.serviceCode ?? ``,
        notificationGroup: c.notificationGroup ?? ``,
        remark: c.remark ?? ``,
        pushTitleTh: c.pushTitleTh ?? ``,
        pushTitleEn: c.pushTitleEn ?? ``,
        pushBodyTh: c.pushBodyTh ?? ``,
        pushBodyEn: c.pushBodyEn ?? ``,
        pushDeeplink: c.pushDeeplink ?? ``,
        emailSubjectTh: c.emailSubjectTh ?? ``,
        emailSubjectEn: c.emailSubjectEn ?? ``,
        emailBodyTh: c.emailBodyTh ?? ``,
        emailBodyEn: c.emailBodyEn ?? ``,
        emailDisplayNameTh: c.emailDisplayNameTh ?? ``,
        emailDisplayNameEn: c.emailDisplayNameEn ?? ``,
        emailFromAddress: c.emailFromAddress ?? ``,
        emailTemplateName: c.emailTemplateName ?? ``,
        smsMessageTh: c.smsMessageTh ?? ``,
        smsMessageEn: c.smsMessageEn ?? ``,
        createdBy: `Panisa R.`,
        updatedBy: `Panisa R.`,
        lastUpdated: O,
      },
    };
  };
function App() {
  let c = useHash(),
    [l, _] = (0, import_react.useState)(!1),
    [T, E] = (0, import_react.useState)(!1),
    [D, O] = (0, import_react.useState)(null),
    [A, j] = (0, import_react.useState)(null),
    [M, N] = (0, import_react.useState)(null),
    [F, I] = (0, import_react.useState)(TEMPLATES),
    [L, R] = (0, import_react.useState)(BROADCASTS),
    [z, B] = (0, import_react.useState)(null),
    [V, H] = (0, import_react.useState)(null),
    U = (c) => {
      location.hash = c;
    },
    W = (c) => {
      (N(c), U(`/list`));
    },
    G = (c, l) => (_, T) => {
      (I((l) => [fromValues(_, T, c, l.length + 1), ...l]), W(l));
    };
  if (c === `#/login`)
    return (0, import_jsx_runtime.jsx)(Login, { onSignIn: () => U(`/list`) });
  let K = (c, l) => {
      let _ = Math.max(0, ...L.map((c) => Number(c.id.slice(3)))) + 1,
        T = `BC-${String(_).padStart(4, `0`)}`;
      (R((l) => [{ ...c, id: T }, ...l]),
        B({ name: c.name, draft: l === `draft` }),
        U(`/broadcast`));
    },
    q = c.match(/^#\/broadcast\/edit\/([A-Z]+-\d+)$/)?.[1],
    J = q ? L.find((c) => c.id === q && c.status === `Draft`) : void 0;
  if (J)
    return (0, import_jsx_runtime.jsx)(
      BroadcastWizard,
      {
        initial: J,
        onBack: () => U(`/broadcast`),
        onCreate: (c, l) => {
          (R((l) => l.map((l) => (l.id === J.id ? { ...c, id: J.id } : l))),
            B({ name: c.name, draft: l === `draft` }),
            U(`/broadcast`));
        },
      },
      c,
    );
  if (c.startsWith(`#/broadcast/create`)) {
    let l = formPreset(c.match(/^#\/broadcast\/create\/([a-z-]+)$/)?.[1]);
    return (0, import_jsx_runtime.jsx)(
      BroadcastWizard,
      {
        failNext: c.endsWith(`/fail`),
        preset: l,
        onBack: () => U(`/broadcast`),
        onCreate: K,
      },
      c,
    );
  }
  if (c.startsWith(`#/create`))
    return (0, import_jsx_runtime.jsx)(TemplateForm, {
      mode: `create`,
      title: `Create notification`,
      loading: c.endsWith(`/loading`),
      initialToggles: { push: !1, email: !1, sms: !1 },
      failNext: c.endsWith(`/fail`),
      onBack: () => U(`/list`),
      onSaveDraft: G(`Draft`, `draft`),
      onSubmit: G(`Published`, `published`),
    });
  let X = c.match(/^#\/edit\/([^/]+)/),
    Z = X ? F.find((c) => c.id === X[1]) : void 0;
  if (X && Z) {
    let l = Z;
    return (0, import_jsx_runtime.jsx)(TemplateForm, {
      mode: `edit`,
      title: `Edit`,
      initialValues: toValues(l),
      initialToggles: togglesOf(l),
      failNext: c.endsWith(`/fail`),
      onBack: () => U(`/list`),
      onSaveDraft: () => W(`draft`),
      onUpdate: () => W(`updated`),
      onSubmit: () => W(`published`),
    });
  }
  let Q =
      c === `#/list/loading`
        ? `loading`
        : c === `#/list/error` || (X && !Z)
          ? `error`
          : c === `#/list/empty`
            ? `empty`
            : `ready`,
    $ = c.match(/^#\/list\/import(?:\/([a-z-]+))?$/),
    ee =
      $ && IMPORT_PRESETS.includes($[1] ?? `initial`)
        ? ($[1] ?? `initial`)
        : void 0,
    te = c.startsWith(`#/broadcast`),
    ne = listPreset(c.match(/^#\/broadcast\/([a-z-]+)$/)?.[1]),
    re = c.match(/^#\/broadcast\/view\/([A-Z]+-\d+)$/)?.[1],
    ie = V ?? (re ? L.find((c) => c.id === re) : void 0);
  return (0, import_jsx_runtime.jsxs)(ProductShell, {
    logo: (0, import_jsx_runtime.jsx)(`img`, {
      src: `/bbl-logo.svg`,
      alt: `Bangkok Bank`,
      width: 161,
      height: 40,
    }),
    nav: NAV,
    activeId: te ? `broadcast` : `template-management`,
    onSelect: (c) => U(c === `broadcast` ? `/broadcast` : `/list`),
    footer: (0, import_jsx_runtime.jsx)(ProfileRow, {
      initials: `PR`,
      name: `Panisa R.`,
      role: `Analyst`,
      expanded: l,
      onClick: () => _((c) => !c),
    }),
    overlay: l
      ? (0, import_jsx_runtime.jsx)(ProfileMenu, {
          initials: `PR`,
          name: `Panisa Rungsawat`,
          role: `Analyst`,
          onDismiss: () => _(!1),
          actions: [
            {
              label: `Logout`,
              iconSlug: `logout`,
              onClick: () => {
                (_(!1), E(!0));
              },
            },
          ],
        })
      : void 0,
    children: [
      te
        ? (0, import_jsx_runtime.jsx)(BroadcastList, {
            broadcasts: c === `#/broadcast/empty` ? [] : L,
            onCreate: () => U(`/broadcast/create`),
            onOpen: H,
            created: ne ? LIST_TOAST[ne] : z,
            holdToast: !!ne,
            onCreatedClose: () => B(null),
          })
        : (0, import_jsx_runtime.jsx)(Dashboard, {
            templates: Q === `empty` ? [] : F,
            state: Q,
            notice: M,
            onNoticeClose: () => N(null),
            onRetry: () => U(`/list`),
            onCreate: () => U(`/create`),
            onOpenTemplate: O,
            downloadRequest: A,
            onDownloadRequestHandled: () => j(null),
            importPreset: ee,
            onImport: (c) =>
              I((l) => [
                ...c.map((c, _) => stampImported(c, l.length + 1 + _)),
                ...l,
              ]),
          }),
      te &&
        ie &&
        (0, import_jsx_runtime.jsx)(
          BroadcastDrawer,
          {
            broadcast: ie,
            onClose: () => {
              (H(null), re && U(`/broadcast`));
            },
            onEdit: () => {
              (H(null), U(`/broadcast/edit/${ie.id}`));
            },
          },
          ie.id,
        ),
      D &&
        (0, import_jsx_runtime.jsx)(TemplateDrawer, {
          template: D,
          onClose: () => O(null),
          onEdit: () => {
            let c = D;
            (O(null), U(`/edit/${c.id}`));
          },
          onDownload: () => {
            let c = D;
            (O(null), j(c));
          },
        }),
      (0, import_jsx_runtime.jsx)(LogoutDialog, {
        open: T,
        onConfirm: () => {
          (E(!1), U(`/login`));
        },
        onCancel: () => E(!1),
      }),
    ],
  });
}
function r(c) {
  var l,
    _,
    T = ``;
  if (typeof c == `string` || typeof c == `number`) T += c;
  else if (typeof c == `object`) {
    if (Array.isArray(c)) {
      var E = c.length;
      for (l = 0; l < E; l++)
        c[l] && (_ = r(c[l])) && (T && (T += ` `), (T += _));
    } else for (_ in c) c[_] && (T && (T += ` `), (T += _));
  }
  return T;
}
function clsx() {
  for (var c, l, _ = 0, T = ``, E = arguments.length; _ < E; _++)
    (c = arguments[_]) && (l = r(c)) && (T && (T += ` `), (T += l));
  return T;
}
function cn(...c) {
  return clsx(c);
}
var CHIP_STATE = {
  default: {
    default: `webds-chip--default-default`,
    selected: `webds-chip--default-selected`,
    disabled: `webds-chip--default-disabled`,
  },
  highlight: {
    default: `webds-chip--highlight-default`,
    selected: `webds-chip--highlight-selected`,
    disabled: `webds-chip--highlight-disabled`,
  },
};
function Chip({
  appearance: c = `default`,
  state: l = `default`,
  pill: _ = !1,
  className: T,
  children: E,
  ...D
}) {
  return (0, import_jsx_runtime.jsx)(`button`, {
    type: `button`,
    disabled: l === `disabled`,
    className: cn(
      `webds-chip`,
      _ ? `webds-chip--s1` : `webds-chip--s2`,
      CHIP_STATE[c][l],
      T,
    ),
    ...D,
    children: (0, import_jsx_runtime.jsx)(`span`, {
      "data-part": `Label`,
      className: `webds-chip-2`,
      children: E,
    }),
  });
}
var APPEARANCE = {
  default: cn(`webds-outline-button--default`, ``),
  neutral: cn(`webds-outline-button--neutral`, ``),
  negative: cn(`webds-outline-button--negative`, ``),
};
function OutlineButton({
  appearance: c = `default`,
  force: l,
  className: _,
  ...T
}) {
  return (0, import_jsx_runtime.jsx)(`button`, {
    type: `button`,
    "data-force": l ?? void 0,
    className: cn(`webds-outline-button`, APPEARANCE[c], _),
    ...T,
  });
}
var WHOLE = `\0whole`,
  UNSECTIONED = `Unsectioned`,
  GUIDE = {
    decision: [196.77, 92.75],
    process: [178.5, 93.18],
    connector: 140,
    note: [300, 140],
  },
  WEB_SCREEN = 1920,
  DECISION_W = 465 / WEB_SCREEN,
  CONNECTOR_PER_DECISION = 49.05 / 167.12,
  symbolScale = (c) => (DECISION_W * c[0]) / GUIDE.decision[0],
  sizeOf = (c, l) => {
    let _ = symbolScale(l);
    return c === `screen`
      ? l
      : c === `decision`
        ? [GUIDE.decision[0] * _, GUIDE.decision[1] * _]
        : c === `note`
          ? [GUIDE.note[0] * _, GUIDE.note[1] * _]
          : [GUIDE.process[0] * _, GUIDE.process[1] * _];
  },
  TEXT_BASE = {
    decision: GUIDE.decision[0],
    tag: GUIDE.process[0],
    terminal: GUIDE.process[0],
    note: GUIDE.note[0],
  },
  ZOOM_MIN = 0.01,
  ZOOM_MAX = 2,
  SCREEN_MIN_PX = 40,
  LABEL_PX = 0.6,
  CAPTION_H = 62,
  SECTION_ROW = 4e3,
  LOOSE_GAP = 400,
  RANK_GAP = 720,
  ROW_GAP = 800,
  sectionOf = (c) => c.section ?? UNSECTIONED,
  clamp = (c, l, _) => Math.min(_, Math.max(l, c));
function pickSubgraph(c, l) {
  if (l === WHOLE) return { nodes: c.nodes, edges: c.edges, exits: new Map() };
  let _ = new Map(c.nodes.map((c) => [c.id, c])),
    T = new Map();
  for (let l of c.edges)
    (T.has(l.from) || T.set(l.from, new Set()),
      T.has(l.to) || T.set(l.to, new Set()),
      T.get(l.from).add(l.to),
      T.get(l.to).add(l.from));
  let E = new Set(c.nodes.filter((c) => sectionOf(c) === l).map((c) => c.id)),
    D = c.nodes.filter((c) => E.has(c.id) && c.x != null && c.y != null),
    O = bboxOf(D);
  for (let l of D.length ? c.nodes : []) {
    if (l.x == null || l.y == null || E.has(l.id)) continue;
    let c = l.x + (l.w ?? 0) / 2,
      _ = l.y + (l.h ?? 0) / 2;
    c >= O.x && c <= O.x + O.w && _ >= O.y && _ <= O.y + O.h && E.add(l.id);
  }
  for (let l = !0; l;) {
    l = !1;
    for (let _ of c.nodes) {
      if (E.has(_.id) || _.kind === `screen` || _.kind === `note`) continue;
      let c = [...(T.get(_.id) ?? [])],
        D = c.filter((c) => E.has(c)).length,
        O = _.x == null;
      (D >= 2 || (c.length === 1 && D === 1) || (O && D >= 1)) &&
        (E.add(_.id), (l = !0));
    }
  }
  let A = c.edges.filter((c) => E.has(c.from) && E.has(c.to)),
    j = new Map();
  for (let l of c.edges) {
    if (!E.has(l.from) || E.has(l.to)) continue;
    let c = _.get(l.to);
    if (!c) continue;
    let T = j.get(l.from) ?? [];
    (T.some((l) => l.id === c.id) || T.push(c), j.set(l.from, T));
  }
  return { nodes: c.nodes.filter((c) => E.has(c.id)), edges: A, exits: j };
}
function place(c, l, _) {
  let T = c.map((c) => {
      let [l, T] = sizeOf(c.kind, _);
      return { ...c, w: c.w ?? l, h: c.h ?? T };
    }),
    E = T.filter((c) => c.x != null && c.y != null);
  if (E.length) {
    let c = new Map(E.map((c) => [c.id, { ...c, x: c.x, y: c.y }])),
      D = Math.max(...E.map((c) => c.y + c.h)),
      O = Math.min(...E.map((c) => c.x));
    return T.map((T) => {
      let E = c.get(T.id);
      if (E) return E;
      let A = l.find((l) => l.to === T.id && c.has(l.from)),
        j = l.find((l) => l.from === T.id && c.has(l.to)),
        M = c.get(A?.from ?? j?.to ?? ``);
      if (!M) {
        let c = O;
        return ((O += T.w + LOOSE_GAP), { ...T, x: c, y: D + LOOSE_GAP });
      }
      let N = M.y + Math.min(M.h, _[1]) / 2 - T.h / 2;
      return {
        ...T,
        x: A ? M.x + M.w + LOOSE_GAP : M.x - T.w - LOOSE_GAP,
        y: N,
      };
    });
  }
  let D = new Set(c.map((c) => c.id)),
    O = new Map();
  for (let c of l)
    c.style !== `back` &&
      D.has(c.from) &&
      D.has(c.to) &&
      O.set(c.to, (O.get(c.to) ?? 0) + 1);
  let A = new Map(),
    j = c.filter((c) => !O.get(c.id)).map((c) => c.id);
  (!j.length && c[0] && j.push(c[0].id), j.forEach((c) => A.set(c, 0)));
  for (let c = 0; c < j.length; c++)
    for (let _ of l)
      _.from === j[c] &&
        D.has(_.to) &&
        !A.has(_.to) &&
        (A.set(_.to, A.get(j[c]) + 1), j.push(_.to));
  let M = new Map(j.map((c, l) => [c, l]));
  for (let _ = 0; _ < c.length; _++) {
    let c = !1;
    for (let _ of l) {
      if (
        _.style === `back` ||
        !A.has(_.from) ||
        !A.has(_.to) ||
        (M.get(_.to) ?? 0) < (M.get(_.from) ?? 0)
      )
        continue;
      let l = A.get(_.from) + 1;
      A.get(_.to) < l && (A.set(_.to, l), (c = !0));
    }
    if (!c) break;
  }
  let N = mainOf(c, l),
    F = new Map();
  for (let c of T) {
    let l = A.get(c.id) ?? 0;
    F.set(l, [...(F.get(l) ?? []), c]);
  }
  let I = new Map([...F].map(([c, l]) => [c, Math.max(...l.map((c) => c.w))])),
    L = new Map(),
    R = 0;
  for (let c of [...F.keys()].sort((c, l) => c - l))
    (L.set(c, R), (R += I.get(c) + RANK_GAP));
  let z = (c) => c.find((c) => N.has(c.id)),
    B = Math.max(...[...F.values()].map((c) => z(c)?.h ?? 0)),
    V = [];
  for (let [c, l] of F) {
    let _ = z(l),
      T = B + ROW_GAP;
    for (let E of l) {
      let l = L.get(c) + (I.get(c) - E.w) / 2;
      E === _
        ? V.push({ ...E, x: l, y: (B - E.h) / 2, col: c })
        : (V.push({ ...E, x: l, y: T, col: c }), (T += E.h + LOOSE_GAP));
    }
  }
  let H = new Map(V.map((c) => [c.id, c]));
  for (let c of [...F.keys()].sort((c, l) => c - l)) {
    let T = z(F.get(c));
    if (!T || T.kind === `screen`) continue;
    let E = l.find(
      (c) =>
        c.to === T.id &&
        (c.style ?? `solid`) === `solid` &&
        !c.inferred &&
        N.has(c.from) &&
        H.has(c.from),
    );
    if (!E) continue;
    let D = H.get(E.from),
      O =
        E.touch && D.kind === `screen`
          ? D.y + ((E.touch.y + E.touch.h / 2) * D.h) / _[1]
          : D.y + D.h / 2,
      A = H.get(T.id);
    A.y = clamp(O - A.h / 2, 0, Math.max(0, B - A.h));
  }
  return c.map((c) => V.find((l) => l.id === c.id));
}
function mainOf(c, l) {
  let _ = new Set(c.map((c) => c.id)),
    T = new Set(
      l
        .filter((c) => c.style !== `back` && _.has(c.from) && _.has(c.to))
        .map((c) => c.to),
    ),
    E = new Set(c.filter((c) => !T.has(c.id)).map((c) => c.id));
  !E.size && c[0] && E.add(c[0].id);
  for (let c = 0, T = [...E]; c < T.length; c++)
    for (let D of l)
      D.from === T[c] &&
        _.has(D.to) &&
        (D.style ?? `solid`) === `solid` &&
        !D.inferred &&
        !E.has(D.to) &&
        (E.add(D.to), T.push(D.to));
  return E;
}
function bboxOf(c) {
  if (!c.length) return { x: 0, y: 0, w: 1, h: 1 };
  let l = Math.min(...c.map((c) => c.x)),
    _ = Math.min(...c.map((c) => c.y)),
    T = Math.max(...c.map((c) => c.x + c.w)),
    E = Math.max(...c.map((c) => c.y + c.h));
  return { x: l, y: _, w: T - l, h: E - _ };
}
function elbow(c, l) {
  let _ = c.x + c.w / 2,
    T = c.y + c.h / 2,
    E = l.x + l.w / 2,
    D = l.y + l.h / 2;
  if (l.x >= c.x + c.w || l.x + l.w <= c.x) {
    let O = E > _,
      A = O ? c.x + c.w : c.x,
      j = O ? l.x : l.x + l.w,
      M = (A + j) / 2;
    return [
      [A, T],
      [M, T],
      [M, D],
      [j, D],
    ];
  }
  let O = D > T,
    A = O ? c.y + c.h : c.y,
    j = O ? l.y : l.y + l.h,
    M = (A + j) / 2;
  return [
    [_, A],
    [_, M],
    [E, M],
    [E, j],
  ];
}
function halfway(c, l = 0.5) {
  let _ = c.slice(1).map((l, _) => Math.hypot(l[0] - c[_][0], l[1] - c[_][1])),
    T = _.reduce((c, l) => c + l, 0) * l;
  for (let l = 0; l < _.length; l++) {
    if (T <= _[l] || l === _.length - 1) {
      let E = _[l] ? T / _[l] : 0;
      return [
        c[l][0] + (c[l + 1][0] - c[l][0]) * E,
        c[l][1] + (c[l + 1][1] - c[l][1]) * E,
      ];
    }
    T -= _[l];
  }
  return c[0];
}
var ScreenNode = (0, import_react.memo)(function ({
    route: c,
    w: l,
    h: _,
    renderScreen: T,
    wireframe: E,
  }) {
    return (0, import_jsx_runtime.jsx)(`div`, {
      inert: !0,
      className: cn(`webds-tfv-screen`, E && `webds-wireframe`),
      style: { width: l, height: _ },
      children: T(c, { wireframe: E, w: l, h: _ }),
    });
  }),
  EDGE_KINDS = [`solid`, `dashed`, `back`, `inferred`],
  EDGE_LABEL = {
    solid: `Main / Happy case`,
    dashed: `Negative case`,
    back: `Back / Alternative case`,
    inferred: `Inferred (not drawn)`,
  },
  edgeKind = (c) => (c.inferred ? `inferred` : (c.style ?? `solid`));
function sectionsOf(c) {
  let l = new Map();
  for (let _ of c.nodes) {
    let c = sectionOf(_);
    (l.has(c) || l.set(c, []),
      _.x != null &&
        _.y != null &&
        l.get(c).push({ x: _.x, y: _.y, w: _.w ?? 0, h: _.h ?? 0 }));
  }
  return [...l.entries()]
    .map(([l, _]) => ({
      name: l,
      box: bboxOf(_),
      count: c.nodes.filter((c) => c.kind !== `note` && sectionOf(c) === l)
        .length,
    }))
    .sort(
      (c, l) =>
        Math.floor(c.box.y / SECTION_ROW) - Math.floor(l.box.y / SECTION_ROW) ||
        c.box.x - l.box.x,
    );
}
var short = (c, l = 44) => (c.length > l ? `${c.slice(0, l - 1)}…` : c);
function TaskFlowView({
  graph: c,
  renderScreen: l,
  currentRoute: _,
  onOpen: T,
  wireframe: E = !1,
  className: D,
}) {
  let O = (0, import_react.useMemo)(() => sectionsOf(c), [c]),
    A = (0, import_react.useMemo)(() => {
      if (O.length < 2) return WHOLE;
      let l = c.nodes.find((c) => c.route && c.route === _);
      return l ? sectionOf(l) : WHOLE;
    }, [c, O, _]),
    [j, M] = (0, import_react.useState)(A);
  (0, import_react.useEffect)(() => M(A), [A, c]);
  let [N, F] = (0, import_react.useState)(E);
  (0, import_react.useEffect)(() => F(E), [E]);
  let I = (0, import_react.useMemo)(
      () => (c.screen ? [c.screen.w, c.screen.h] : [1920, 1080]),
      [c.screen],
    ),
    L = (0, import_react.useMemo)(() => pickSubgraph(c, j), [c, j]),
    R = (0, import_react.useMemo)(() => place(L.nodes, L.edges, I), [L, I]),
    z = (0, import_react.useMemo)(() => new Map(R.map((c) => [c.id, c])), [R]),
    B = (0, import_react.useMemo)(() => bboxOf(R), [R]),
    V = (0, import_react.useRef)(null),
    [H, U] = (0, import_react.useState)({ w: 0, h: 0 });
  (0, import_react.useLayoutEffect)(() => {
    let c = V.current;
    if (!c) return;
    let l = new ResizeObserver(() =>
      U({ w: c.clientWidth, h: c.clientHeight }),
    );
    return (
      l.observe(c),
      U({ w: c.clientWidth, h: c.clientHeight }),
      () => l.disconnect()
    );
  }, []);
  let [W, G] = (0, import_react.useState)({ k: 0.1, tx: 0, ty: 0 }),
    K = (0, import_react.useCallback)(() => {
      if (!H.w || !H.h) return;
      let c = clamp(Math.min((H.w - 96) / B.w, (H.h - 96) / B.h), ZOOM_MIN, 1);
      G({ k: c, tx: (H.w - B.w * c) / 2, ty: (H.h - B.h * c) / 2 });
    }, [H.w, H.h, B]);
  ((0, import_react.useEffect)(K, [K]),
    (0, import_react.useEffect)(() => {
      let c = V.current;
      if (!c) return;
      let l = (l) => {
        l.preventDefault();
        let _ = l.deltaMode === 1 ? 16 : l.deltaMode === 2 ? c.clientHeight : 1,
          T = l.deltaX * _,
          E = l.deltaY * _;
        if (!(l.ctrlKey || l.metaKey)) {
          G((c) => ({ ...c, tx: c.tx - T, ty: c.ty - E }));
          return;
        }
        let D = c.getBoundingClientRect(),
          O = l.clientX - D.left,
          A = l.clientY - D.top;
        G((c) => {
          let l = clamp(
            c.k * Math.exp(-clamp(E, -30, 30) * 0.01),
            ZOOM_MIN,
            ZOOM_MAX,
          );
          return {
            k: l,
            tx: O - (O - c.tx) * (l / c.k),
            ty: A - (A - c.ty) * (l / c.k),
          };
        });
      };
      return (
        c.addEventListener(`wheel`, l, { passive: !1 }),
        () => c.removeEventListener(`wheel`, l)
      );
    }, []));
  let q = (0, import_react.useRef)(null),
    J = (0, import_react.useRef)(!1),
    X = (c) => {
      ((q.current = {
        x: c.clientX,
        y: c.clientY,
        tx: W.tx,
        ty: W.ty,
        moved: !1,
      }),
        (J.current = !1));
    },
    Z = (c) => {
      let l = q.current;
      if (!l) return;
      let _ = c.clientX - l.x,
        T = c.clientY - l.y;
      (!l.moved && Math.hypot(_, T) < 4) ||
        (l.moved || V.current?.setPointerCapture(c.pointerId),
        (l.moved = !0),
        (J.current = !0),
        G((c) => ({ ...c, tx: l.tx + _, ty: l.ty + T })));
    },
    Q = () => {
      q.current = null;
    },
    $ = (c) =>
      G((l) => {
        let _ = clamp(c(l.k), ZOOM_MIN, ZOOM_MAX),
          T = H.w / 2,
          E = H.h / 2;
        return {
          k: _,
          tx: T - (T - l.tx) * (_ / l.k),
          ty: E - (E - l.ty) * (_ / l.k),
        };
      }),
    ee = (c) => {
      c && !J.current && T?.(c);
    },
    te = (c) => M(sectionOf(c)),
    { k: ne } = W,
    re = { x: -W.tx / ne, y: -W.ty / ne, w: H.w / ne, h: H.h / ne },
    ie = (c) =>
      c.x - B.x < re.x + re.w * 1.25 &&
      c.x - B.x + c.w > re.x - re.w * 0.25 &&
      c.y - B.y < re.y + re.h * 1.25 &&
      c.y - B.y + c.h > re.y - re.h * 0.25,
    ae = Math.max(1, LABEL_PX / ne),
    oe = ne * ae * 18 >= 8,
    se = I[0] / WEB_SCREEN,
    ce = Math.max(4 * se, 1.5 / ne),
    le = (c) => ({ x: c.x - B.x, y: c.y - B.y, w: c.w, h: c.h }),
    ue = (c) => {
      let l = TEXT_BASE[c.kind] ?? c.w,
        _ = c.w / l;
      return { width: l, height: c.h / _, transform: `scale(${_})` };
    },
    de = (c) => c.x,
    fe = (c, l) => {
      if (!c.touch) return null;
      let _ = le(l),
        T = _.w / I[0],
        E = _.h / I[1];
      return {
        x: _.x + c.touch.x * T,
        y: _.y + c.touch.y * E,
        w: c.touch.w * T,
        h: c.touch.h * E,
      };
    },
    pe = (GUIDE.decision[0] * symbolScale(I) * CONNECTOR_PER_DECISION) / 2,
    me = (c, l) => {
      let _ = le(c),
        T = l ? l.x + l.w / 2 : _.x + _.w / 2,
        E = _.y + _.h + LOOSE_GAP / 2 + pe;
      return R.some(
        (l) =>
          l.id !== c.id &&
          Math.abs(l.x - B.x + l.w / 2 - T) < l.w / 2 + pe &&
          l.y - B.y < E + pe &&
          l.y - B.y + l.h > E - pe,
      )
        ? { cx: T, cy: _.y - LOOSE_GAP / 2 - pe, edge: l ? l.y : _.y, up: !0 }
        : { cx: T, cy: E, edge: l ? l.y + l.h : _.y + _.h, up: !1 };
    },
    he = L.edges.flatMap((c, l) => {
      let _ = z.get(c.from),
        T = z.get(c.to);
      return _ && T && edgeKind(c) === `back` && de(T) < de(_)
        ? [{ i: l, e: c, a: _, b: T }]
        : [];
    }),
    ge = new Map();
  for (let c of he) ge.set(c.b.id, (ge.get(c.b.id) ?? 0) + 1);
  let _e = new Map(),
    ve = he.map((c, l) => {
      let _ = ge.get(c.b.id),
        T = _e.get(c.b.id) ?? 0;
      _e.set(c.b.id, T + 1);
      let E = le(c.b),
        D =
          _ > 1
            ? {
                x: E.x + E.w * (0.25 + (0.5 * T) / (_ - 1)),
                y: E.y,
                w: 0,
                h: E.h,
              }
            : null;
      return {
        i: c.i,
        e: c.e,
        from: me(c.a, fe(c.e, c.a)),
        to: me(c.b, D),
        letter: String.fromCharCode(65 + l),
      };
    }),
    ye = (c, l) => {
      let _ = c.up ? c.cy + pe : c.cy - pe;
      return l
        ? [
            [c.cx, c.edge],
            [c.cx, _],
          ]
        : [
            [c.cx, _],
            [c.cx, c.edge],
          ];
    },
    be = new Map(),
    xe = new Map(),
    Se = clamp(11 / (24 * ne), se, 3 * se),
    Ce = 53 * Se,
    we = new Set();
  {
    let c = (c, l, _, T) =>
        c + l * (_ === 1 ? 0.5 : 0.25 + (0.5 * T) / (_ - 1)),
      l = (c) => c.y + c.h / 2,
      _ = (c) => c.x + c.w / 2,
      T = 24 * se,
      E = (c) => c.col ?? 0,
      D = new Map(),
      O = new Map();
    for (let c of R) {
      let l = le(c);
      (D.set(E(c), Math.min(D.get(E(c)) ?? 1 / 0, l.x)),
        O.set(E(c), Math.max(O.get(E(c)) ?? -1 / 0, l.x + l.w)));
    }
    let A = (c) => O.get(c - 1) ?? D.get(c) - RANK_GAP,
      j = (c) => D.get(c) ?? O.get(c - 1) + RANK_GAP,
      M = (c) => R.filter((l) => E(l) === c).map(le),
      N = (c, l, _) => {
        for (let E = l; E <= _; E++)
          if (M(E).some((l) => c > l.y - T && c < l.y + l.h + T)) return !0;
        return !1;
      },
      F = [];
    L.edges.forEach((c, _) => {
      if (ve.some((c) => c.i === _)) return;
      let T = z.get(c.from),
        D = z.get(c.to);
      if (!T || !D) return;
      let O = le(T),
        A = le(D),
        j = E(T),
        M = E(D),
        I = fe(c, T),
        L = Math.min(O.y + O.h, A.y + A.h),
        B = Math.max(O.y, A.y),
        V = R.some(
          (c) =>
            c.id !== T.id &&
            c.id !== D.id &&
            E(c) === j &&
            le(c).y + le(c).h > L &&
            le(c).y < B,
        ),
        H =
          M === j
            ? V
              ? `s`
              : `v`
            : M === j + 1 ||
                (M > j && !N(l(I ?? O), j + 1, M - 1) && !N(l(A), j + 1, M - 1))
              ? `h`
              : `c`;
      F.push({
        i: _,
        A: O,
        B: A,
        t: I,
        from: c.from,
        to: c.to,
        ca: j,
        cb: M,
        mode: H,
        sx: 0,
        sy: 0,
        ex: 0,
        ey: 0,
        cyr: 0,
      });
    });
    let I = (c, l) => {
        let _ = new Map();
        for (let T of c) _.set(l(T), [...(_.get(l(T)) ?? []), T]);
        return [..._.values()];
      },
      B = F.filter((c) => c.mode !== `v`);
    for (let c of B) c.t && ([c.sx, c.sy] = [c.t.x + c.t.w, l(c.t)]);
    for (let l of I(
      B.filter((c) => c.t),
      (c) => c.from,
    )) {
      let _ = [];
      for (let c of [...l].sort((c, l) => c.t.y - l.t.y)) {
        let l = _.find((l) =>
          l.some((l) => l.t.y < c.t.y + c.t.h && c.t.y < l.t.y + l.t.h),
        );
        l ? l.push(c) : _.push([c]);
      }
      for (let l of _) {
        if (l.length < 2) continue;
        let _ = Math.max(...l.map((c) => c.t.y)),
          T = Math.min(...l.map((c) => c.t.y + c.t.h));
        l.sort((c, l) => c.t.x - l.t.x).forEach(
          (E, D) => (E.sy = c(_, T - _, l.length, D)),
        );
      }
    }
    for (let _ of I(
      B.filter((c) => !c.t),
      (c) => c.from,
    ))
      (_.sort((c, _) => l(c.B) - l(_.B)),
        _.forEach(
          (l, T) =>
            ([l.sx, l.sy] = [l.A.x + l.A.w, c(l.A.y, l.A.h, _.length, T)]),
        ));
    let V = F.filter((c) => c.mode === `c`);
    if (V.length) {
      let c = R.map(le).sort((c, l) => c.y - l.y),
        l = c[0].y + c[0].h,
        _ = l + ROW_GAP;
      for (let T of c) {
        if (T.y > l + ROW_GAP / 2) {
          _ = T.y;
          break;
        }
        l = Math.max(l, T.y + T.h);
      }
      let T = l + (_ - l) * 0.15,
        E = l + (_ - l) * 0.6;
      V.sort(
        (c, l) => Math.min(c.ca, c.cb) - Math.min(l.ca, l.cb) || c.cb - l.cb,
      ).forEach((c, l) => (c.cyr = T + ((E - T) * (l + 1)) / (V.length + 1)));
    }
    for (let l of I(
      F.filter((c) => c.mode === `h` || c.mode === `c`),
      (c) => c.to,
    )) {
      (l.sort(
        (c, l) =>
          (c.mode === `c` ? c.cyr : c.sy) - (l.mode === `c` ? l.cyr : l.sy),
      ),
        l.forEach(
          (_, T) => ([_.ex, _.ey] = [_.B.x, c(_.B.y, _.B.h, l.length, T)]),
        ));
      for (let c of l)
        c.mode !== `h` ||
          c.sy <= c.B.y + T ||
          c.sy >= c.B.y + c.B.h - T ||
          l.some((l) => l !== c && Math.abs(l.ey - c.sy) < T) ||
          (c.ey = c.sy);
    }
    for (let l of I(
      F.filter((c) => c.mode === `s`),
      (c) => c.to,
    ))
      (l.sort((c, l) => c.sy - l.sy),
        l.forEach(
          (_, T) =>
            ([_.ex, _.ey] = [_.B.x + _.B.w, c(_.B.y, _.B.h, l.length, T)]),
        ));
    let H = new Map(),
      U = (c, l) => H.set(c, [...(H.get(c) ?? []), { ...l, lane: 0 }]);
    for (let c of F)
      (c.mode === `h` && U(c.cb, { l: c, inY: c.sy, outY: c.ey, part: `h` }),
        c.mode === `s` &&
          U(c.ca + 1, { l: c, inY: c.sy, outY: c.ey, part: `s` }),
        c.mode === `c` &&
          (U(c.ca + 1, { l: c, inY: c.sy, outY: c.cyr, part: `exit` }),
          U(c.cb, { l: c, inY: c.cyr, outY: c.ey, part: `entry` })));
    let W = new Map();
    for (let [c, l] of H) {
      let _ = A(c),
        T = j(c);
      l.sort(
        (c, l) =>
          Number(l.part === `s`) - Number(c.part === `s`) ||
          c.inY - l.inY ||
          c.outY - l.outY,
      );
      for (let c = 0; c < l.length; c++) {
        let c = !1;
        for (let _ = 0; _ < l.length; _++)
          for (let T = _ + 1; T < l.length; T++)
            l[_].part !== `s` &&
              l[T].part !== `s` &&
              Math.abs(l[T].inY - l[_].outY) < 1 &&
              Math.abs(l[_].inY - l[_].outY) >= 1 &&
              (([l[_], l[T]] = [l[T], l[_]]), (c = !0));
        if (!c) break;
      }
      l.forEach((c, E) =>
        W.set(`${c.l.i}:${c.part}`, _ + ((T - _) * (E + 1)) / (l.length + 1)),
      );
      for (let c of l) {
        let _ = c.l;
        if (c.part !== `h`) continue;
        if (Math.abs(_.sy - _.ey) < 1) {
          be.set(_.i, [
            [_.sx, _.sy],
            [_.ex, _.ey],
          ]);
          continue;
        }
        let T = W.get(`${_.i}:h`);
        be.set(_.i, [
          [_.sx, _.sy],
          [T, _.sy],
          [T, _.ey],
          [_.ex, _.ey],
        ]);
        let E = Math.abs(_.ey - _.sy),
          D = _.B.h / 2 + Ce / 2 + 8 * se;
        if (
          l.filter((c) => c.part === `h` && c.l.from === _.from).length >= 3 &&
          E > D + Ce / 2
        ) {
          let c = Math.abs(T - _.sx);
          (xe.set(_.i, (c + E - D) / (c + E + Math.abs(_.ex - T))),
            we.add(_.i));
        }
      }
    }
    for (let c of F) {
      if (c.mode === `s`) {
        let l = W.get(`${c.i}:s`);
        be.set(c.i, [
          [c.sx, c.sy],
          [l, c.sy],
          [l, c.ey],
          [c.ex, c.ey],
        ]);
      }
      if (c.mode === `c`) {
        let l = W.get(`${c.i}:exit`),
          _ = W.get(`${c.i}:entry`);
        be.set(c.i, [
          [c.sx, c.sy],
          [l, c.sy],
          [l, c.cyr],
          [_, c.cyr],
          [_, c.ey],
          [c.ex, c.ey],
        ]);
        let T = be.get(c.i),
          E = T.slice(1).reduce(
            (c, l, _) => c + Math.hypot(l[0] - T[_][0], l[1] - T[_][1]),
            0,
          ),
          D = Math.abs(l - c.sx) + Math.abs(c.cyr - c.sy);
        xe.set(c.i, (D + Math.abs(_ - l) / 2) / E);
      }
    }
    let G = F.filter((c) => c.mode === `v`);
    for (let E of I(G, (c) => c.to))
      (E.sort((c, l) => (c.t ? _(c.t) : _(c.A)) - (l.t ? _(l.t) : _(l.A))),
        E.forEach((D, O) => {
          let A = l(D.B) > l(D.A),
            j = D.t ?? D.A,
            M = _(j),
            N = A ? j.y + j.h : j.y,
            F =
              E.length === 1 && M > D.B.x + T && M < D.B.x + D.B.w - T
                ? M
                : c(D.B.x, D.B.w, E.length, O),
            I = A ? D.B.y : D.B.y + D.B.h,
            L = A ? (D.A.y + D.A.h + D.B.y) / 2 : (D.B.y + D.B.h + D.A.y) / 2;
          (be.set(
            D.i,
            Math.abs(M - F) < 1
              ? [
                  [M, N],
                  [F, I],
                ]
              : [
                  [M, N],
                  [M, L],
                  [F, L],
                  [F, I],
                ],
          ),
            xe.set(D.i, 0.75));
        }));
  }
  let Te = (0, import_react.useMemo)(() => mainOf(L.nodes, L.edges), [L]),
    [Ee, De] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (!Ee) return;
    let c = setTimeout(() => De(null), 1400);
    return () => clearTimeout(c);
  }, [Ee]);
  let Oe = 24 * Se * ne >= 9,
    ke = new Map();
  {
    let c = [],
      l = (c, l, [_, T]) => {
        let E = (l.length * 17 + 25.5) * Se;
        return we.has(c)
          ? { x: _ + ce * 2, y: T - Ce / 2, w: E, h: Ce }
          : { x: _ - E / 2, y: T - Ce / 2, w: E, h: Ce };
      },
      _ = (l) =>
        c.some(
          (c) =>
            l.x < c.x + c.w &&
            c.x < l.x + l.w &&
            l.y < c.y + c.h &&
            c.y < l.y + l.h,
        );
    if (oe) {
      for (let l of R)
        if (l.kind === `screen`) {
          let _ = le(l);
          c.push({
            x: _.x,
            y: _.y - CAPTION_H * ae,
            w: _.w,
            h: CAPTION_H * ae,
          });
        }
    }
    let T = L.edges
      .map((c, l) => l)
      .sort((c, l) => Number(we.has(l)) - Number(we.has(c)));
    for (let E of T) {
      let T = L.edges[E],
        D = z.get(T.from),
        O = z.get(T.to);
      if (!D || !O || !T.label) continue;
      let A = ve.find((c) => c.i === E),
        j = A ? ye(A.from, !0) : (be.get(E) ?? elbow(le(D), le(O))),
        M = A ? 0.75 : (xe.get(E) ?? 0.5),
        N = we.has(E)
          ? [M]
          : [M, 0.35, 0.65, 0.25, 0.75, 0.15, 0.85, 0.1, 0.9, 0.05, 0.95],
        F = null;
      for (let c of N) {
        let D = halfway(j, c);
        if (!_(l(E, T.label, D))) {
          F = D;
          break;
        }
      }
      F && (ke.set(E, F), c.push(l(E, T.label, F)));
    }
  }
  let Ae = {
      screens: R.filter((c) => c.kind === `screen`).length,
      decisions: R.filter((c) => c.kind === `decision`).length,
    },
    je = c.source,
    Me =
      (je.kind ?? `figma`) === `code`
        ? `unfolded from code · ${je.path} · ${je.extractedAt}`
        : `Figma ${je.file} ${je.node} · ${je.extractedAt}`;
  return (0, import_jsx_runtime.jsxs)(`div`, {
    className: cn(`webds-tfv`, D),
    children: [
      (0, import_jsx_runtime.jsxs)(`div`, {
        className: `webds-tfv-toolbar`,
        children: [
          (0, import_jsx_runtime.jsx)(`p`, {
            className: `webds-tfv-title`,
            children: `Task flow`,
          }),
          (0, import_jsx_runtime.jsx)(`div`, {
            className: `webds-tfv-chips`,
            children:
              O.length > 1 &&
              (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
                children: [
                  (0, import_jsx_runtime.jsx)(Chip, {
                    state: j === WHOLE ? `selected` : `default`,
                    appearance: `highlight`,
                    onClick: () => M(WHOLE),
                    children: `Whole flow`,
                  }),
                  O.map((c) =>
                    (0, import_jsx_runtime.jsx)(
                      Chip,
                      {
                        state: j === c.name ? `selected` : `default`,
                        appearance: `highlight`,
                        onClick: () => M(c.name),
                        children: `${short(c.name)} · ${c.count}`,
                      },
                      c.name,
                    ),
                  ),
                ],
              }),
          }),
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `webds-tfv-group`,
            children: [
              (0, import_jsx_runtime.jsx)(Chip, {
                state: N ? `default` : `selected`,
                appearance: `highlight`,
                onClick: () => F(!1),
                children: `Hi-fi`,
              }),
              (0, import_jsx_runtime.jsx)(Chip, {
                state: N ? `selected` : `default`,
                appearance: `highlight`,
                onClick: () => F(!0),
                children: `Wireframe`,
              }),
            ],
          }),
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `webds-tfv-group`,
            children: [
              (0, import_jsx_runtime.jsx)(OutlineButton, {
                onClick: () => $((c) => c / 2),
                "aria-label": `Zoom out`,
                children: `−`,
              }),
              (0, import_jsx_runtime.jsx)(`span`, {
                className: `webds-tfv-zoom`,
                "aria-live": `polite`,
                children: `${Math.round(ne * 100)}%`,
              }),
              (0, import_jsx_runtime.jsx)(OutlineButton, {
                onClick: () => $((c) => c * 2),
                "aria-label": `Zoom in`,
                children: `+`,
              }),
              (0, import_jsx_runtime.jsx)(OutlineButton, {
                onClick: () => $(() => 1),
                children: `100%`,
              }),
              (0, import_jsx_runtime.jsx)(OutlineButton, {
                onClick: K,
                children: `Fit`,
              }),
            ],
          }),
        ],
      }),
      (0, import_jsx_runtime.jsxs)(`div`, {
        ref: V,
        className: `webds-tfv-canvas`,
        onPointerDown: X,
        onPointerMove: Z,
        onPointerUp: Q,
        onPointerCancel: Q,
        children: [
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `webds-tfv-board`,
            style: {
              transform: `translate(${W.tx}px, ${W.ty}px) scale(${ne})`,
              width: B.w,
              height: B.h,
            },
            children: [
              R.map((c) => {
                let E = le(c),
                  D =
                    c.route && c.route === _
                      ? {
                          boxShadow: `0 0 0 ${Math.max(8, 3 / ne)}px var(--color-border-highlight-default)`,
                        }
                      : void 0,
                  O = !!c.route && !!T,
                  A = {
                    role: O ? `button` : void 0,
                    tabIndex: O ? 0 : void 0,
                    title: c.route ? `${c.route} · ${c.label}` : c.label,
                    onClick: O ? () => ee(c.route) : void 0,
                    onKeyDown: O
                      ? (l) => l.key === `Enter` && ee(c.route)
                      : void 0,
                  },
                  j = { left: E.x, top: E.y, width: E.w };
                if (c.kind === `screen`) {
                  let _ = !!c.route && ie(c) && c.w * ne >= SCREEN_MIN_PX;
                  return (0, import_jsx_runtime.jsxs)(
                    `div`,
                    {
                      ...A,
                      className: cn(
                        `webds-tfv-node`,
                        O && `webds-tfv-node--open`,
                      ),
                      style: { ...j, height: E.h, ...D },
                      children: [
                        _
                          ? (0, import_jsx_runtime.jsx)(ScreenNode, {
                              route: c.route,
                              w: c.w,
                              h: c.h,
                              renderScreen: l,
                              wireframe: N,
                            })
                          : (0, import_jsx_runtime.jsx)(`div`, {
                              className: `webds-tfv-placeholder`,
                            }),
                        oe &&
                          (0, import_jsx_runtime.jsxs)(`div`, {
                            className: `webds-tfv-caption`,
                            style: {
                              transform: `scale(${ae})`,
                              width: c.w / ae,
                            },
                            children: [
                              (0, import_jsx_runtime.jsx)(`p`, {
                                className: `webds-tfv-caption-route`,
                                children: c.route ?? `no route`,
                              }),
                              (0, import_jsx_runtime.jsx)(`p`, {
                                className: `webds-tfv-caption-label`,
                                children: c.label,
                              }),
                            ],
                          }),
                      ],
                    },
                    c.id,
                  );
                }
                return c.kind === `note`
                  ? (0, import_jsx_runtime.jsx)(
                      `div`,
                      {
                        title: c.label,
                        className: `webds-tfv-node webds-tfv-note`,
                        style: { ...j, height: E.h },
                        children: (0, import_jsx_runtime.jsx)(`p`, {
                          className: `webds-tfv-note-text`,
                          style: ue(c),
                          children: c.label,
                        }),
                      },
                      c.id,
                    )
                  : c.kind === `decision`
                    ? (0, import_jsx_runtime.jsx)(
                        `div`,
                        {
                          ...A,
                          className: `webds-tfv-node`,
                          style: { ...j, height: E.h },
                          children: (0, import_jsx_runtime.jsxs)(`div`, {
                            className: `webds-tfv-fit webds-tfv-symbol webds-tfv-decision`,
                            style: ue(c),
                            children: [
                              (0, import_jsx_runtime.jsx)(`span`, {
                                className: `webds-tfv-decision-mark`,
                                "aria-hidden": !0,
                              }),
                              (0, import_jsx_runtime.jsx)(`p`, {
                                className: `webds-tfv-symbol-text`,
                                children: c.label,
                              }),
                            ],
                          }),
                        },
                        c.id,
                      )
                    : (0, import_jsx_runtime.jsx)(
                        `div`,
                        {
                          ...A,
                          className: cn(
                            `webds-tfv-node`,
                            O && `webds-tfv-node--open`,
                          ),
                          style: { ...j, height: E.h, ...D },
                          children: (0, import_jsx_runtime.jsx)(`div`, {
                            className: cn(
                              `webds-tfv-fit webds-tfv-symbol webds-tfv-process`,
                              !Te.has(c.id) && `webds-tfv-symbol--alt`,
                            ),
                            style: ue(c),
                            children: (0, import_jsx_runtime.jsx)(`p`, {
                              className: `webds-tfv-symbol-text`,
                              children: c.label,
                            }),
                          }),
                        },
                        c.id,
                      );
              }),
              (0, import_jsx_runtime.jsxs)(`svg`, {
                className: `webds-tfv-edges`,
                width: B.w,
                height: B.h,
                children: [
                  (0, import_jsx_runtime.jsx)(`defs`, {
                    children: EDGE_KINDS.map((c) =>
                      (0, import_jsx_runtime.jsxs)(
                        `g`,
                        {
                          children: [
                            (0, import_jsx_runtime.jsx)(`marker`, {
                              id: `webds-tfv-start-${c}`,
                              viewBox: `0 0 10 10`,
                              refX: `5`,
                              refY: `5`,
                              markerWidth: `3`,
                              markerHeight: `3`,
                              orient: `auto`,
                              children: (0, import_jsx_runtime.jsx)(`path`, {
                                d: `M0 5 L5 0 L10 5 L5 10 z`,
                                className: `webds-tfv-ink--${c}`,
                              }),
                            }),
                            (0, import_jsx_runtime.jsx)(`marker`, {
                              id: `webds-tfv-end-${c}`,
                              viewBox: `0 0 10 10`,
                              refX: `9`,
                              refY: `5`,
                              markerWidth: `3.5`,
                              markerHeight: `3.5`,
                              orient: `auto`,
                              children: (0, import_jsx_runtime.jsx)(`path`, {
                                d: `M1 1 L9 5 L1 9`,
                                className: `webds-tfv-ink--${c} webds-tfv-arrowhead`,
                              }),
                            }),
                          ],
                        },
                        c,
                      ),
                    ),
                  }),
                  L.edges.map((c, l) => {
                    let _ = z.get(c.from),
                      T = z.get(c.to);
                    if (!_ || !T) return null;
                    let E = edgeKind(c),
                      D =
                        E === `inferred`
                          ? `${ce} ${ce * 2.5}`
                          : E === `solid`
                            ? void 0
                            : `${ce * 2} ${ce * 2}`,
                      O = ve.find((c) => c.i === l);
                    return (
                      O
                        ? [ye(O.from, !0), ye(O.to, !1)]
                        : [be.get(l) ?? elbow(le(_), le(T))]
                    ).map((c, _) =>
                      (0, import_jsx_runtime.jsx)(
                        `polyline`,
                        {
                          points: c.map((c) => c.join(`,`)).join(` `),
                          className: `webds-tfv-edge webds-tfv-ink--${E}`,
                          strokeWidth: E === `inferred` ? ce * 0.75 : ce,
                          strokeDasharray: D,
                          markerStart:
                            _ === 0 ? `url(#webds-tfv-start-${E})` : void 0,
                          markerEnd: `url(#webds-tfv-end-${E})`,
                        },
                        `${l}-${_}`,
                      ),
                    );
                  }),
                  L.edges.map((c, l) => {
                    let _ = z.get(c.from),
                      T = _ ? fe(c, _) : null;
                    return T
                      ? (0, import_jsx_runtime.jsx)(
                          `rect`,
                          {
                            x: T.x,
                            y: T.y,
                            width: T.w,
                            height: T.h,
                            rx: 4 * se,
                            className: `webds-tfv-touch`,
                            strokeWidth: Math.max(2 * se, 1.5 / ne),
                            strokeDasharray: `${Math.max(8 * se, 3 / ne)} ${Math.max(8 * se, 3 / ne)}`,
                          },
                          `t${l}`,
                        )
                      : null;
                  }),
                ],
              }),
              ve.flatMap((c) =>
                [c.from, c.to].map((l, _) => {
                  let T = _ === 0 ? c.to : c.from,
                    E = () => {
                      J.current ||
                        (G((c) => ({
                          ...c,
                          tx: H.w / 2 - T.cx * c.k,
                          ty: H.h / 2 - T.cy * c.k,
                        })),
                        De(`${c.i}-${1 - _}`));
                    };
                  return (0, import_jsx_runtime.jsx)(
                    `div`,
                    {
                      role: `button`,
                      tabIndex: 0,
                      className: cn(
                        `webds-tfv-node webds-tfv-node--open webds-tfv-jump`,
                        Ee === `${c.i}-${_}` && `webds-tfv-jump--flash`,
                      ),
                      title: `${c.letter}: ${c.e.label ?? `jump`} — go to the other ${c.letter}`,
                      onClick: E,
                      onKeyDown: (c) => c.key === `Enter` && E(),
                      style: {
                        left: l.cx - pe,
                        top: l.cy - pe,
                        width: pe * 2,
                        height: pe * 2,
                      },
                      children: (0, import_jsx_runtime.jsx)(`div`, {
                        className: `webds-tfv-fit webds-tfv-connector`,
                        style: {
                          width: GUIDE.connector,
                          height: GUIDE.connector,
                          transform: `scale(${(pe * 2) / GUIDE.connector})`,
                        },
                        children: (0, import_jsx_runtime.jsx)(`p`, {
                          className: `webds-tfv-connector-letter`,
                          children: c.letter,
                        }),
                      }),
                    },
                    `c${c.i}-${_}`,
                  );
                }),
              ),
              Oe &&
                L.edges.map((c, l) => {
                  let _ = z.get(c.from),
                    T = z.get(c.to);
                  if (!_ || !T || !c.label) return null;
                  let E = ke.get(l);
                  if (!E) return null;
                  let [D, O] = E;
                  return (0, import_jsx_runtime.jsx)(
                    `p`,
                    {
                      className: `webds-tfv-edge-label webds-tfv-edge-label--${edgeKind(c)}`,
                      style: we.has(l)
                        ? {
                            left: D,
                            top: O,
                            transformOrigin: `left center`,
                            transform: `translate(${ce * 2}px, -50%) scale(${Se})`,
                          }
                        : {
                            left: D,
                            top: O,
                            transform: `translate(-50%, -50%) scale(${Se})`,
                          },
                      children: c.label,
                    },
                    `l${l}`,
                  );
                }),
              oe &&
                [...L.exits.entries()].map(([c, l]) => {
                  let _ = z.get(c);
                  if (!_) return null;
                  let T = le(_);
                  return (0, import_jsx_runtime.jsx)(
                    `div`,
                    {
                      className: `webds-tfv-exits`,
                      style: {
                        left: T.x + T.w,
                        top: T.y,
                        transform: `scale(${ae})`,
                      },
                      children: l.map((c) =>
                        (0, import_jsx_runtime.jsx)(
                          `button`,
                          {
                            type: `button`,
                            className: `webds-tfv-exit`,
                            onPointerDown: (c) => c.stopPropagation(),
                            onClick: () => te(c),
                            children: `to ${short(c.route ?? c.label, 28)} · ${short(sectionOf(c), 24)}`,
                          },
                          c.id,
                        ),
                      ),
                    },
                    `x${c}`,
                  );
                }),
            ],
          }),
          (0, import_jsx_runtime.jsxs)(`div`, {
            className: `webds-tfv-legend`,
            children: [
              EDGE_KINDS.map((c) =>
                (0, import_jsx_runtime.jsxs)(
                  `span`,
                  {
                    className: `webds-tfv-legend-item`,
                    children: [
                      (0, import_jsx_runtime.jsx)(`svg`, {
                        width: `28`,
                        height: `6`,
                        className: `webds-tfv-legend-swatch`,
                        children: (0, import_jsx_runtime.jsx)(`line`, {
                          x1: `0`,
                          y1: `3`,
                          x2: `28`,
                          y2: `3`,
                          className: `webds-tfv-ink--${c}`,
                          strokeWidth: c === `inferred` ? 1.5 : 2,
                          strokeDasharray:
                            c === `solid`
                              ? void 0
                              : c === `inferred`
                                ? `2 4`
                                : `5 4`,
                        }),
                      }),
                      EDGE_LABEL[c],
                    ],
                  },
                  c,
                ),
              ),
              (0, import_jsx_runtime.jsx)(`span`, {
                className: `webds-tfv-legend-meta`,
                children: `Scroll or drag to move · pinch or ⌘/Ctrl + scroll to zoom`,
              }),
              (0, import_jsx_runtime.jsx)(`span`, {
                className: `webds-tfv-legend-meta`,
                children: `${Ae.screens} screens · ${Ae.decisions} decisions · ${L.edges.length} connectors · ${Me}`,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function TaskFlowOverlay({
  graph: c,
  renderScreen: l,
  currentRoute: _,
  onNavigate: T,
  title: E,
}) {
  let [D] = (0, import_react.useState)(
      () => new URLSearchParams(typeof location > `u` ? `` : location.search),
    ),
    [O, A] = (0, import_react.useState)(() => D.get(`flow`) === `1`);
  return (
    (0, import_react.useEffect)(() => {
      if (!O) return;
      let c = (c) => c.key === `Escape` && A(!1);
      return (
        window.addEventListener(`keydown`, c),
        () => window.removeEventListener(`keydown`, c)
      );
    }, [O]),
    O
      ? (0, import_jsx_runtime.jsxs)(`div`, {
          role: `dialog`,
          "aria-modal": `true`,
          "aria-label": `Task flow`,
          className: `webds-tfv-overlay`,
          children: [
            (0, import_jsx_runtime.jsxs)(`div`, {
              className: `webds-tfv-overlay-head`,
              children: [
                (0, import_jsx_runtime.jsx)(`p`, {
                  className: `webds-tfv-legend-meta`,
                  children: `${E ? `${E} — ` : ``}task flow${_ ? ` around ${_}` : ``}. Click a screen to open it · Esc closes`,
                }),
                (0, import_jsx_runtime.jsx)(OutlineButton, {
                  onClick: () => A(!1),
                  children: `Close`,
                }),
              ],
            }),
            (0, import_jsx_runtime.jsx)(`div`, {
              className: `webds-tfv-overlay-body`,
              children: (0, import_jsx_runtime.jsx)(TaskFlowView, {
                graph: c,
                renderScreen: l,
                currentRoute: _,
                wireframe: D.get(`wf`) === `1`,
                onOpen:
                  T &&
                  ((c) => {
                    (A(!1), T(c));
                  }),
              }),
            }),
          ],
        })
      : (0, import_jsx_runtime.jsx)(`div`, {
          className: `webds-tfv-trigger`,
          children: (0, import_jsx_runtime.jsx)(OutlineButton, {
            onClick: () => A(!0),
            children: `Task flow`,
          }),
        })
  );
}
var project = `cnh-phase2`,
  name = `CNH — Phase 2: Import Template · Broadcast message`,
  status = `in-progress`,
  shippedAt = `2026-10-05`,
  dsVersion = `0.28.0`,
  summary = `Phase 2 of the Customer Notification Hub console, its first requirement: import notification templates from .jsonl files (JSON Lines, one template per line — since 2026-10-06) — one or many — into the list. Built from the PO's written requirement with NO Figma frame, on the same dev-target build as the Phase 1 delivery (cnh-notification-management), so every state here is the running code, reached by its own route. Rulings (Korn, 2026-10-05): a dialog on the list, not a page; several files at once, and any file in error blocks the import until it is removed; the list sorts by Last updated, newest first; an import is always a Draft and lands on page 1 in the order the files were picked; uploading covers the whole dialog. The file format is the one the list already downloads, so a downloaded file imports back. Sized for 10–50 files after a 50-file test showed 4 of 50 rows and none of the bad ones. Still open: the schema, size limits, duplicates and all copy (P2-1…P2-9 in the delivery's docs/open-questions.md). Its second requirement, Broadcast message (2026-10-05, reworked 2026-10-06 from the BA's AI draft): a list, a one-page Create form (recipient type CIS / Direct, Direct = Email or SMS by radio, Send as soon as possible / Schedule + Do Not Disturb, Save draft, a Draft reopens with Edit) and a view drawer — every Create state on its own route.`,
  owner = `Korn`,
  code = {
    path: `~/Desktop/Claude/prototypes/cnh-tm-devtarget-v2 (outside this repo — source handed to the CNH dev team; Import is src/pages/ImportDialog.tsx + src/data/import-spec.ts)`,
    preview: `https://cnh-tm-phase2.vercel.app/`,
    stack: `Vite + React 19 against the dev team's @bbl-web/ui-components@0.0.22 and webds's dev-target tokens — the Phase 1 delivery's stack, unchanged. The task flow below is the running build in frames: each state has a route (#/list/import/<state>), so nothing on it is a picture.`,
  },
  flows = [
    {
      slug: `import-templates`,
      name: `Import templates`,
      entry: `The Import button in the list header, beside Create notification`,
      notes: `Every state the requirement names (initial, file selected, uploading, success, failure, invalid file format, invalid template structure) plus the two the build added: Import pressed with no file, and more than 50 files. A file is checked the moment it is picked; files in error sort to the top and one action removes them all.`,
      screens: [
        { name: `The list (entry)`, route: `#/list` },
        { name: `Import dialog — initial`, route: `#/list/import` },
        { name: `Import pressed with no file`, route: `#/list/import/no-file` },
        { name: `Invalid file format`, route: `#/list/import/invalid-format` },
        {
          name: `Invalid template structure`,
          route: `#/list/import/invalid-structure`,
        },
        { name: `Files selected — all valid`, route: `#/list/import/selected` },
        {
          name: `Uploading — the whole dialog`,
          route: `#/list/import/uploading`,
        },
        { name: `Import failure`, route: `#/list/import/failure` },
        {
          name: `Import success — back on the list, toast 3 s`,
          route: `#/list/import/success`,
        },
      ],
      reuses: {},
    },
    {
      slug: `broadcast-create`,
      name: `Create broadcast`,
      entry: `Create broadcast in the Broadcast message list header`,
      notes: `The build-5 page (Create notification's shell, "Step N" sections, sticky footer) filled with the BA's AI draft's six steps (Korn, 2026-10-06): Basic information · Audience file (5-row preview) · Recipient mapping & channels (CIS / Direct with the ID column chosen from the file; checkboxes for CIS, Direct = Email or SMS by radio) · Manual content (the file's columns as chips, one card per channel) · Delivery (as soon as possible / schedule) · Do Not Disturb. Every state has a route that opens straight into it with fixed demo content (cnh-tm-devtarget-v2 src/data/broadcast-presets.ts); waits and toasts are held. A Draft's drawer has Edit (Korn, 2026-10-06): the same page, pre-filled with the draft and its file, saved back under the same id; Scheduled and later have no Edit (P2-20).`,
      screens: [
        { name: `Broadcast list (entry)`, route: `#/broadcast` },
        { name: `Create broadcast — empty`, route: `#/broadcast/create` },
        {
          name: `File cannot be read (.txt)`,
          route: `#/broadcast/create/file-error`,
        },
        {
          name: `CIS file read — preview, CIS_ID, channel checkboxes`,
          route: `#/broadcast/create/cis`,
        },
        {
          name: `Direct recipient — SMS by radio, 2 rows skipped, Email / SMS cards`,
          route: `#/broadcast/create/direct`,
        },
        {
          name: `Submit on an empty form — every section marked`,
          route: `#/broadcast/create/errors`,
        },
        {
          name: `Save draft with no name`,
          route: `#/broadcast/create/draft-no-name`,
        },
        { name: `Steps 1–6 filled`, route: `#/broadcast/create/filled` },
        {
          name: `Scheduled into the quiet period — first send moves`,
          route: `#/broadcast/create/quiet`,
        },
        {
          name: `Submit this broadcast? (confirm)`,
          route: `#/broadcast/create/confirm`,
        },
        { name: `Submitting (held)`, route: `#/broadcast/create/submitting` },
        {
          name: `Unable to submit the broadcast`,
          route: `#/broadcast/create/fail-dialog`,
        },
        {
          name: `You are about to leave this page`,
          route: `#/broadcast/create/leave`,
        },
        {
          name: `List — Broadcast submitted (toast held)`,
          route: `#/broadcast/submitted`,
        },
        {
          name: `List — Draft saved (toast held)`,
          route: `#/broadcast/draft-saved`,
        },
        {
          name: `Draft opened in the drawer — Edit`,
          route: `#/broadcast/view/BC-0007`,
        },
        {
          name: `Edit broadcast — the draft reopened, saved in place`,
          route: `#/broadcast/edit/BC-0007`,
        },
      ],
    },
  ],
  gaps = [
    `No file upload / dropzone in webds or in @bbl-web/ui-components — the drop area and the file row are authored from DialogPopup, OutlineButton, GhostButton, IconButton and InlineMessage (file-drop-area).`,
    `No determinate progress bar in either (CDS has linear-progress-bar, a different grammar) — Uploading is an indeterminate SpinnerLoader.`,
    "The package's own index.css writes `var(rgba(0, 0, 0, 0), …)`, which Vite 8's CSS minifier refuses; the runner builds with cssMinify off.",
    "webds has no `upload` icon — the build uses `share`, the same glyph (arrow up over a baseline), and `alert` is a bell, so errors use `caution`.",
  ],
  handBuilt = [`file-drop-area`],
  graph$1 = {
    source: {
      kind: `code`,
      path: `cnh-tm-devtarget-v2/src/pages/ImportDialog.tsx · src/data/import-spec.ts · src/pages/BroadcastWizard.tsx · src/pages/broadcast/useBroadcastForm.ts · src/data/broadcast-presets.ts`,
      extractedAt: `2026-10-06`,
    },
    screen: { w: 1920, h: 1080 },
    nodes: [
      {
        id: `list`,
        kind: `screen`,
        label: `The list`,
        route: `#/list`,
        section: `Import`,
      },
      {
        id: `initial`,
        kind: `screen`,
        label: `Import dialog — initial`,
        route: `#/list/import`,
        section: `Import`,
      },
      {
        id: `no-file`,
        kind: `screen`,
        label: `Import pressed with no file`,
        route: `#/list/import/no-file`,
        section: `Import`,
      },
      {
        id: `over-50`,
        kind: `decision`,
        label: `More than 50 files?`,
        section: `Import`,
      },
      {
        id: `cap`,
        kind: `tag`,
        label: `Keep the first 50 · say how many were left out`,
        section: `Import`,
      },
      {
        id: `parses`,
        kind: `decision`,
        label: `Every file a .jsonl that parses?`,
        section: `Import`,
      },
      {
        id: `invalid-format`,
        kind: `screen`,
        label: `Invalid file format — Import stays blocked until it is removed`,
        route: `#/list/import/invalid-format`,
        section: `Import`,
      },
      {
        id: `fields`,
        kind: `decision`,
        label: `Every template has the required fields?`,
        section: `Import`,
      },
      {
        id: `invalid-structure`,
        kind: `screen`,
        label: `Invalid template structure — Import stays blocked until it is removed`,
        route: `#/list/import/invalid-structure`,
        section: `Import`,
      },
      {
        id: `selected`,
        kind: `screen`,
        label: `Files selected — all valid`,
        route: `#/list/import/selected`,
        section: `Import`,
      },
      {
        id: `uploading`,
        kind: `screen`,
        label: `Uploading`,
        route: `#/list/import/uploading`,
        section: `Import`,
      },
      {
        id: `uploaded`,
        kind: `decision`,
        label: `Upload succeeded?`,
        section: `Import`,
      },
      {
        id: `failure`,
        kind: `screen`,
        label: `Import failure`,
        route: `#/list/import/failure`,
        section: `Import`,
      },
      {
        id: `success`,
        kind: `screen`,
        label: `Import success — new drafts on top, toast 3 s`,
        route: `#/list/import/success`,
        section: `Import`,
      },
      {
        id: `bc-list`,
        kind: `screen`,
        label: `Broadcast list`,
        route: `#/broadcast`,
        section: `Broadcast`,
      },
      {
        id: `bc-form`,
        kind: `screen`,
        label: `Create broadcast — empty`,
        route: `#/broadcast/create`,
        section: `Broadcast`,
      },
      {
        id: `bc-readable`,
        kind: `decision`,
        label: `File .csv / .xlsx, ≤ 10 MB, 1–1,000 rows?`,
        section: `Broadcast`,
      },
      {
        id: `bc-file-error`,
        kind: `screen`,
        label: `File cannot be read`,
        route: `#/broadcast/create/file-error`,
        section: `Broadcast`,
      },
      {
        id: `bc-type`,
        kind: `decision`,
        label: `Recipient type?`,
        section: `Broadcast`,
      },
      {
        id: `bc-cis`,
        kind: `screen`,
        label: `CIS — preview, checkboxes`,
        route: `#/broadcast/create/cis`,
        section: `Broadcast`,
      },
      {
        id: `bc-direct`,
        kind: `screen`,
        label: `Direct — Email or SMS`,
        route: `#/broadcast/create/direct`,
        section: `Broadcast`,
      },
      {
        id: `bc-filled`,
        kind: `screen`,
        label: `Steps 1–6 filled`,
        route: `#/broadcast/create/filled`,
        section: `Broadcast`,
      },
      {
        id: `bc-quiet`,
        kind: `screen`,
        label: `Start in the quiet period`,
        route: `#/broadcast/create/quiet`,
        section: `Broadcast`,
      },
      {
        id: `bc-valid`,
        kind: `decision`,
        label: `Every section valid?`,
        section: `Broadcast`,
      },
      {
        id: `bc-errors`,
        kind: `screen`,
        label: `Every section marked`,
        route: `#/broadcast/create/errors`,
        section: `Broadcast`,
      },
      {
        id: `bc-confirm`,
        kind: `screen`,
        label: `Submit this broadcast?`,
        route: `#/broadcast/create/confirm`,
        section: `Broadcast`,
      },
      {
        id: `bc-submitting`,
        kind: `screen`,
        label: `Submitting`,
        route: `#/broadcast/create/submitting`,
        section: `Broadcast`,
      },
      {
        id: `bc-saved`,
        kind: `decision`,
        label: `Saved?`,
        section: `Broadcast`,
      },
      {
        id: `bc-fail`,
        kind: `screen`,
        label: `Unable to submit`,
        route: `#/broadcast/create/fail-dialog`,
        section: `Broadcast`,
      },
      {
        id: `bc-submitted`,
        kind: `screen`,
        label: `Broadcast submitted`,
        route: `#/broadcast/submitted`,
        section: `Broadcast`,
      },
      {
        id: `bc-has-name`,
        kind: `decision`,
        label: `Broadcast name entered?`,
        section: `Broadcast`,
      },
      {
        id: `bc-draft-no-name`,
        kind: `screen`,
        label: `Name needed for a draft`,
        route: `#/broadcast/create/draft-no-name`,
        section: `Broadcast`,
      },
      {
        id: `bc-draft-saved`,
        kind: `screen`,
        label: `Draft saved`,
        route: `#/broadcast/draft-saved`,
        section: `Broadcast`,
      },
      {
        id: `bc-dirty`,
        kind: `decision`,
        label: `Anything entered?`,
        section: `Broadcast`,
      },
      {
        id: `bc-leave`,
        kind: `screen`,
        label: `Leave this page?`,
        route: `#/broadcast/create/leave`,
        section: `Broadcast`,
      },
      {
        id: `bc-view`,
        kind: `screen`,
        label: `Draft opened — Edit`,
        route: `#/broadcast/view/BC-0007`,
        section: `Broadcast`,
      },
      {
        id: `bc-edit`,
        kind: `screen`,
        label: `Edit broadcast — the draft reopened`,
        route: `#/broadcast/edit/BC-0007`,
        section: `Broadcast`,
      },
    ],
    edges: [
      {
        from: `list`,
        to: `initial`,
        label: `Import`,
        style: `solid`,
        touch: { x: 1603, y: 19, w: 86, h: 44 },
      },
      {
        from: `initial`,
        to: `over-50`,
        label: `Pick or drop files`,
        style: `solid`,
        touch: { x: 896, y: 558, w: 127, h: 36 },
      },
      {
        from: `initial`,
        to: `no-file`,
        label: `Import with no file`,
        style: `dashed`,
        touch: { x: 1262, y: 643, w: 82, h: 44 },
      },
      {
        from: `initial`,
        to: `list`,
        label: `Cancel`,
        style: `back`,
        touch: { x: 1168, y: 643, w: 86, h: 44 },
      },
      {
        from: `no-file`,
        to: `over-50`,
        label: `Pick or drop files`,
        style: `solid`,
        touch: { x: 896, y: 540, w: 127, h: 36 },
      },
      { from: `over-50`, to: `cap`, label: `Yes`, style: `dashed` },
      { from: `over-50`, to: `parses`, label: `No`, style: `solid` },
      { from: `cap`, to: `parses`, style: `solid` },
      { from: `parses`, to: `invalid-format`, label: `No`, style: `dashed` },
      { from: `parses`, to: `fields`, label: `Yes`, style: `solid` },
      { from: `fields`, to: `invalid-structure`, label: `No`, style: `dashed` },
      { from: `fields`, to: `selected`, label: `Yes`, style: `solid` },
      {
        from: `invalid-format`,
        to: `selected`,
        label: `Remove N files with errors`,
        style: `solid`,
        touch: { x: 1123, y: 459, w: 221, h: 32 },
      },
      {
        from: `invalid-structure`,
        to: `selected`,
        label: `Remove N files with errors`,
        style: `solid`,
        touch: { x: 1123, y: 459, w: 221, h: 32 },
      },
      {
        from: `selected`,
        to: `uploading`,
        label: `Import`,
        style: `solid`,
        touch: { x: 1262, y: 672, w: 82, h: 44 },
      },
      { from: `uploading`, to: `uploaded`, style: `solid` },
      { from: `uploaded`, to: `success`, label: `Yes`, style: `solid` },
      { from: `uploaded`, to: `failure`, label: `No`, style: `dashed` },
      {
        from: `failure`,
        to: `uploading`,
        label: `Import again`,
        style: `back`,
        touch: { x: 1262, y: 710, w: 82, h: 44 },
      },
      {
        from: `bc-list`,
        to: `bc-form`,
        label: `Create broadcast`,
        style: `solid`,
        touch: { x: 1716, y: 19, w: 188, h: 44 },
      },
      {
        from: `bc-form`,
        to: `bc-readable`,
        label: `Choose file`,
        style: `solid`,
        touch: { x: 900, y: 551, w: 121, h: 36 },
      },
      { from: `bc-readable`, to: `bc-type`, label: `Yes`, style: `solid` },
      {
        from: `bc-readable`,
        to: `bc-file-error`,
        label: `No`,
        style: `dashed`,
      },
      {
        from: `bc-file-error`,
        to: `bc-form`,
        label: `Remove file`,
        style: `back`,
        touch: { x: 1535, y: 439, w: 32, h: 32 },
      },
      { from: `bc-type`, to: `bc-cis`, label: `CIS`, style: `solid` },
      {
        from: `bc-type`,
        to: `bc-direct`,
        label: `Direct recipient`,
        style: `solid`,
      },
      { from: `bc-cis`, to: `bc-filled`, label: `Steps 3–6`, style: `solid` },
      {
        from: `bc-filled`,
        to: `bc-valid`,
        label: `Submit`,
        style: `solid`,
        touch: { x: 1423, y: 1020, w: 177, h: 44 },
      },
      {
        from: `bc-direct`,
        to: `bc-valid`,
        label: `Submit`,
        style: `solid`,
        touch: { x: 1423, y: 1020, w: 177, h: 44 },
      },
      {
        from: `bc-filled`,
        to: `bc-quiet`,
        label: `Schedule delivery`,
        style: `solid`,
      },
      {
        from: `bc-quiet`,
        to: `bc-valid`,
        label: `Submit`,
        style: `solid`,
        touch: { x: 1423, y: 1020, w: 177, h: 44 },
      },
      { from: `bc-valid`, to: `bc-confirm`, label: `Yes`, style: `solid` },
      { from: `bc-valid`, to: `bc-errors`, label: `No`, style: `dashed` },
      {
        from: `bc-errors`,
        to: `bc-valid`,
        label: `Submit`,
        style: `back`,
        touch: { x: 1423, y: 1020, w: 177, h: 44 },
      },
      {
        from: `bc-confirm`,
        to: `bc-submitting`,
        label: `Submit`,
        style: `solid`,
        touch: { x: 1159, y: 625, w: 85, h: 44 },
      },
      {
        from: `bc-confirm`,
        to: `bc-filled`,
        label: `Cancel`,
        style: `back`,
        touch: { x: 1066, y: 625, w: 86, h: 44 },
      },
      { from: `bc-submitting`, to: `bc-saved`, style: `solid` },
      { from: `bc-saved`, to: `bc-submitted`, label: `Yes`, style: `solid` },
      { from: `bc-saved`, to: `bc-fail`, label: `No`, style: `dashed` },
      {
        from: `bc-fail`,
        to: `bc-submitting`,
        label: `Try again`,
        style: `back`,
        touch: { x: 1144, y: 568, w: 100, h: 44 },
      },
      {
        from: `bc-fail`,
        to: `bc-filled`,
        label: `Close`,
        style: `back`,
        touch: { x: 1061, y: 568, w: 75, h: 44 },
      },
      {
        from: `bc-form`,
        to: `bc-has-name`,
        label: `Save draft`,
        style: `solid`,
        touch: { x: 1222, y: 1020, w: 177, h: 44 },
      },
      {
        from: `bc-filled`,
        to: `bc-has-name`,
        label: `Save draft`,
        style: `solid`,
        touch: { x: 1222, y: 1020, w: 177, h: 44 },
      },
      {
        from: `bc-has-name`,
        to: `bc-draft-saved`,
        label: `Yes`,
        style: `solid`,
      },
      {
        from: `bc-has-name`,
        to: `bc-draft-no-name`,
        label: `No`,
        style: `dashed`,
      },
      {
        from: `bc-filled`,
        to: `bc-dirty`,
        label: `Back`,
        style: `solid`,
        touch: { x: 32, y: 29, w: 24, h: 24 },
      },
      { from: `bc-dirty`, to: `bc-leave`, label: `Yes`, style: `solid` },
      { from: `bc-dirty`, to: `bc-list`, label: `No`, style: `back` },
      {
        from: `bc-leave`,
        to: `bc-list`,
        label: `Leave`,
        style: `back`,
        touch: { x: 1092, y: 565, w: 79, h: 44 },
      },
      {
        from: `bc-leave`,
        to: `bc-filled`,
        label: `Stay`,
        style: `back`,
        touch: { x: 1179, y: 565, w: 65, h: 44 },
      },
      {
        from: `bc-list`,
        to: `bc-view`,
        label: `Draft row`,
        style: `solid`,
        touch: { x: 320, y: 170, w: 1600, h: 64 },
      },
      {
        from: `bc-view`,
        to: `bc-edit`,
        label: `Edit`,
        style: `solid`,
        touch: { x: 1832, y: 1020, w: 64, h: 44 },
      },
      {
        from: `bc-edit`,
        to: `bc-valid`,
        label: `Submit`,
        style: `solid`,
        touch: { x: 1423, y: 1020, w: 177, h: 44 },
      },
      {
        from: `bc-edit`,
        to: `bc-has-name`,
        label: `Save draft`,
        style: `solid`,
        touch: { x: 1222, y: 1020, w: 177, h: 44 },
      },
    ],
    touchMeasured: `2026-10-05 — getBoundingClientRect of the control in the running build at 1920 x 1080 (#/list/import/<state>), screen px · Broadcast 2026-10-06, same method on #/broadcast/... (headless Chrome 1920 x 1080, ?panel=0); no touch where the control is below the 1080 fold (Schedule delivery, y 2043) or none fires the edge (the save itself)`,
  },
  cnh_phase2_default = {
    project,
    name,
    status,
    shippedAt,
    dsVersion,
    summary,
    owner,
    code,
    flows,
    gaps,
    handBuilt,
    graph: graph$1,
  },
  graph = cnh_phase2_default.graph,
  renderScreen = (c, { w: l, h: _ }) =>
    (0, import_jsx_runtime.jsx)(`iframe`, {
      src: `/?panel=0${c}`,
      title: c,
      loading: `lazy`,
      tabIndex: -1,
      style: { width: l, height: _, border: 0, display: `block` },
    }),
  KEY = `cnh-taskflow-hidden`,
  read = () => {
    try {
      return localStorage.getItem(KEY) === `1`;
    } catch {
      return !1;
    }
  },
  write = (c) => {
    try {
      localStorage.setItem(KEY, c ? `1` : `0`);
    } catch {}
  };
function HideToggle() {
  let [c, l] = (0, import_react.useState)(read),
    [_, T] = (0, import_react.useState)(null);
  return (
    (0, import_react.useLayoutEffect)(() => {
      (document.documentElement.classList.toggle(`cnh-tf-hidden`, c), write(c));
      let l = () => {
        let c = document
          .querySelector(`.webds-tfv-trigger`)
          ?.getBoundingClientRect();
        T(c && c.width ? { x: c.right, y: c.top } : null);
      };
      l();
      let _ = setTimeout(l, 300);
      return (
        addEventListener(`resize`, l),
        () => {
          (clearTimeout(_), removeEventListener(`resize`, l));
        }
      );
    }, [c]),
    c
      ? (0, import_jsx_runtime.jsx)(`button`, {
          type: `button`,
          className: `cnh-tf-tab`,
          "aria-label": `Show Task flow`,
          title: `Show Task flow`,
          onClick: () => l(!1),
          children: `›`,
        })
      : _
        ? (0, import_jsx_runtime.jsx)(`button`, {
            type: `button`,
            className: `cnh-tf-hide`,
            "aria-label": `Hide Task flow`,
            title: `Hide Task flow`,
            style: { left: _.x - 10, top: _.y - 10 },
            onClick: () => l(!0),
            children: `×`,
          })
        : null
  );
}
function TaskFlow() {
  let [c, l] = (0, import_react.useState)(location.hash || `#/list`);
  return (
    (0, import_react.useEffect)(() => {
      let c = () => l(location.hash);
      return (
        addEventListener(`hashchange`, c),
        () => removeEventListener(`hashchange`, c)
      );
    }, []),
    new URLSearchParams(location.search).get(`panel`) === `0`
      ? null
      : (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
          children: [
            (0, import_jsx_runtime.jsx)(HideToggle, {}),
            (0, import_jsx_runtime.jsx)(TaskFlowOverlay, {
              graph,
              renderScreen,
              currentRoute: c,
              onNavigate: (c) => {
                location.hash = c.replace(/^#/, ``);
              },
              title: `CNH Phase 2`,
            }),
          ],
        })
  );
}
(0, import_client.createRoot)(document.getElementById(`root`)).render(
  (0, import_jsx_runtime.jsxs)(import_react.StrictMode, {
    children: [
      (0, import_jsx_runtime.jsx)(App, {}),
      (0, import_jsx_runtime.jsx)(TaskFlow, {}),
    ],
  }),
);
