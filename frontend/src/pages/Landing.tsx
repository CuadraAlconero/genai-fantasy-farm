import { useNavigate } from 'react-router-dom';

export function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--color-parchment)]">
            {/* Decorative top border */}
            <div className="w-full max-w-2xl mb-8">
                <div className="h-1 bg-gradient-to-r from-transparent via-[var(--color-wood)] to-transparent" />
            </div>

            {/* Main content */}
            <div className="text-center max-w-2xl">
                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-bold mb-4 text-[var(--color-wood-dark)]"
                    style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}>
                    🌾 Farm Village
                </h1>

                <h2 className="text-2xl md:text-3xl mb-8 text-[var(--color-forest)]"
                    style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}>
                    A Fantasy Life Awaits
                </h2>

                {/* Description */}
                <div className="card-fantasy mb-8">
                    <p className="text-lg leading-relaxed text-[var(--color-ink-light)]">
                        Welcome, traveler! You have arrived at the edge of a peaceful farming village
                        nestled in the rolling hills of a magical realm. Here, the soil is rich,
                        the neighbors are kind (mostly), and adventure lurks just beyond the forest's edge.
                    </p>
                    <p className="text-lg leading-relaxed mt-4 text-[var(--color-ink-light)]">
                        Will you become a respected member of this community?
                        Forge friendships, tend your land, and discover the secrets that lie within...
                    </p>
                </div>

                {/* Enter button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-fantasy text-xl px-10 py-4"
                >
                    ⚔️ Enter the Village ⚔️
                </button>

                {/* Decorative elements */}
                <div className="mt-12 flex justify-center gap-8 text-4xl opacity-60">
                    <span>🏠</span>
                    <span>🌳</span>
                    <span>🐄</span>
                    <span>🌾</span>
                    <span>⛏️</span>
                </div>
            </div>

            {/* Decorative bottom border */}
            <div className="w-full max-w-2xl mt-8">
                <div className="h-1 bg-gradient-to-r from-transparent via-[var(--color-wood)] to-transparent" />
            </div>

            {/* Footer */}
            <p className="mt-8 text-sm text-[var(--color-stone)]">
                An LLM-powered fantasy simulation
            </p>
        </div>
    );
}
