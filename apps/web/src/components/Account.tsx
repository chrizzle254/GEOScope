import { useAuth } from '../contexts/AuthContext';

export function Account() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl">
      <p
        className="text-[#1e1e1e] text-[40px] tracking-[-0.76px] mb-4"
        style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
      >
        Account
      </p>
      <p
        className="text-[#757575] text-[24px] tracking-[-0.456px] mb-12"
        style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
      >
        Manage your account settings
      </p>

      <div className="border-2 border-[#1e1e1e] rounded-lg p-8 mb-6">
        <p
          className="text-[#757575] text-[12px] tracking-[-0.132px] mb-4"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          EMAIL
        </p>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="w-full max-w-md px-6 py-4 border-2 border-[#1e1e1e] rounded text-[20px] tracking-[-0.38px] bg-gray-50"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        />
      </div>

      <div className="border-2 border-[#1e1e1e] rounded-lg p-8">
        <p
          className="text-[#1e1e1e] text-[24px] tracking-[-0.456px] mb-6"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          Subscription
        </p>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span
              className="text-[#757575] text-[18px]"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Status
            </span>
            <span
              className="text-[#1e1e1e] text-[18px]"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              Free Trial (3 days)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-[#757575] text-[18px]"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
            >
              Next billing
            </span>
            <span
              className="text-[#1e1e1e] text-[18px]"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              Not scheduled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
