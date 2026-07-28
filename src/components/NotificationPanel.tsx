export default function NotificationPanel() {
  return (
    <div className="notif-panel" style={{ display: "block" }}>
      <div className="notif-panel-header">
        <span className="notif-panel-title">
          <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          通知 · 3 条未读
        </span>
        <button className="notif-panel-clear">全部标为已读</button>
      </div>

      <div className="notif-item unread">
        <div
          className="notif-item-icon"
          style={{ background: "var(--coral)", borderColor: "var(--coral)" }}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
            <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
            <path d="M12 8v4M12 16h0" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="notif-item-content">
          <div className="notif-item-title">「修复线上生产致命Bug」今天 18:00 截止</div>
          <div className="notif-item-time">2 分钟前 · 紧急</div>
        </div>
      </div>

      <div className="notif-item unread">
        <div
          className="notif-item-icon"
          style={{ background: "var(--coral)", borderColor: "var(--coral)" }}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
            <path
              d="M9 11l3 3L22 4"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="notif-item-content">
          <div className="notif-item-title">「Q2项目复盘报告」已到期</div>
          <div className="notif-item-time">1 小时前 · 逾期 2 天</div>
        </div>
      </div>

      <div className="notif-item unread">
        <div
          className="notif-item-icon"
          style={{ background: "var(--blue)", borderColor: "var(--blue)" }}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
            <path
              d="M5 13l4 4L19 7"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="notif-item-content">
          <div className="notif-item-title">「客户紧急需求评审会议」已完成</div>
          <div className="notif-item-time">3 小时前</div>
        </div>
      </div>

      <div className="notif-empty">暂无通知</div>
    </div>
  );
}
