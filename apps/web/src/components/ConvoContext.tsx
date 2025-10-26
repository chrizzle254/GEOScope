interface ConvoContextProps {
  brandData: any;
}

export function ConvoContext({ brandData }: ConvoContextProps) {
  const contexts = [
    {
      id: 1,
      llm: 'ChatGPT',
      prompt: 'What are the best AI optimization tools?',
      context: 'User was asking about tools for improving AI-generated content visibility...',
      sentiment: 'positive',
      position: 1,
      color: '#10a37f',
    },
  ];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <p
          className="text-[#1e1e1e] text-[40px] tracking-[-0.76px] mb-4"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
        >
          Conversation Context
        </p>
        <p
          className="text-[#757575] text-[20px] tracking-[-0.38px]"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          Understand the context in which your brand is mentioned
        </p>
      </div>

      {contexts.length === 0 ? (
        <div className="border-2 border-[#d9d9d9] rounded-lg p-16 text-center">
          <p
            className="text-[#d9d9d9] text-[24px] tracking-[-0.456px]"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
          >
            Context analysis will appear here once mentions are detected
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {contexts.map((context) => (
            <div key={context.id} className="border-2 border-[#1e1e1e] rounded-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: context.color }}
                  />
                  <p
                    className="text-[#1e1e1e] text-[20px] tracking-[-0.38px]"
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    {context.llm}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="text-[#757575] text-[14px]"
                    style={{ fontFamily: 'Roboto Mono, monospace' }}
                  >
                    Position #{context.position}
                  </span>
                  <span
                    className={`text-[14px] ${context.sentiment === 'positive' ? 'text-[#10a37f]' : 'text-[#d97757]'}`}
                    style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                  >
                    {context.sentiment.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p
                  className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  PROMPT
                </p>
                <p
                  className="text-[#1e1e1e] text-[16px] tracking-[-0.304px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  {context.prompt}
                </p>
              </div>

              <div>
                <p
                  className="text-[#757575] text-[12px] tracking-[-0.132px] mb-2"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
                >
                  CONTEXT
                </p>
                <p
                  className="text-[#757575] text-[16px] tracking-[-0.304px]"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
                >
                  {context.context}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
