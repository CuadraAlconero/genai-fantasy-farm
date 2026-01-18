import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
    title: string;
    description: string;
    icon: string;
    path: string;
    available: boolean;
}

function DashboardCard({ title, description, icon, path, available }: DashboardCardProps) {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => available && navigate(path)}
            disabled={!available}
            className={`card-fantasy text-left w-full transition-all duration-200 ${available
                ? 'hover:scale-105 hover:shadow-lg cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
                }`}
        >
            <div className="flex items-start gap-4">
                <span className="text-4xl">{icon}</span>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-[var(--color-wood-dark)] mb-2">
                        {title}
                        {!available && (
                            <span className="ml-2 text-sm font-normal text-[var(--color-stone)]">
                                (Coming Soon)
                            </span>
                        )}
                    </h3>
                    <p className="text-[var(--color-ink-light)]">{description}</p>
                </div>
            </div>
        </button>
    );
}

export function Dashboard() {
    const navigate = useNavigate();

    const cards: DashboardCardProps[] = [
        {
            title: 'Characters',
            description: 'Meet the villagers and newcomers. View their stories, skills, and personalities.',
            icon: '👥',
            path: '/characters',
            available: true,
        },
        {
            title: 'Your Farm',
            description: 'Tend to your crops, manage livestock, and expand your homestead.',
            icon: '🌾',
            path: '/farm',
            available: false,
        },
        {
            title: 'Event Timeline',
            description: 'Review the history of the village and track important happenings.',
            icon: '📜',
            path: '/timeline',
            available: false,
        },
        {
            title: 'Village Map',
            description: 'Explore locations, discover secrets, and plan your journeys.',
            icon: '🗺️',
            path: '/map',
            available: false,
        },
        {
            title: 'Relationships',
            description: 'Track friendships, rivalries, and alliances between villagers.',
            icon: '💕',
            path: '/relationships',
            available: false,
        },
        {
            title: 'Quests & Goals',
            description: 'View your objectives and track your progress in the village.',
            icon: '⚔️',
            path: '/quests',
            available: false,
        },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-parchment)] p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-[var(--color-wood)] hover:text-[var(--color-forest)] transition-colors"
                    >
                        ← Back to Welcome
                    </button>
                    <h1 className="text-3xl font-bold text-[var(--color-wood-dark)]"
                        style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}>
                        🏘️ Village Dashboard
                    </h1>
                    <div className="w-24" /> {/* Spacer for centering */}
                </div>

                {/* Divider */}
                <div className="h-1 bg-gradient-to-r from-transparent via-[var(--color-wood)] to-transparent mb-8" />

                {/* Welcome message and quick actions */}
                <div className="card-fantasy mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-lg text-[var(--color-ink-light)] text-center md:text-left">
                            Welcome to your village headquarters. From here, you can manage all aspects of your new life.
                        </p>
                        <button
                            onClick={() => navigate('/characters/create')}
                            className="btn-fantasy whitespace-nowrap"
                        >
                            ✨ Create New Character
                        </button>
                    </div>
                </div>

                {/* Dashboard cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                        <DashboardCard key={card.title} {...card} />
                    ))}
                </div>

                {/* Footer info */}
                <div className="mt-12 text-center text-[var(--color-stone)]">
                    <p>More features will be unlocked as the village grows...</p>
                </div>
            </div>
        </div>
    );
}
