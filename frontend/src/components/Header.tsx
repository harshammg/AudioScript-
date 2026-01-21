
const Header = () => {
  return (
    <header className="text-center py-8 md:py-12">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
        AudioScript
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
        Record your voice, then transcribe with precision.
      </p>
    </header>
  );
};

export default Header;
