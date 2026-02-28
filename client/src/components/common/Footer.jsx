export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white mt-12 sm:mt-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div>
          <h3 className="font-display text-base sm:text-lg">JMS Public School Chaudiha</h3>
          <p className="text-sm text-blue-100 mt-2">Nurturing Minds, Building Futures.</p>
        </div>
        <div>
          <h4 className="font-semibold">Quick Links</h4>
          <p className="text-sm text-blue-100 mt-2 leading-relaxed">About | Admissions | Gallery | Contact</p>
        </div>
        <div>
          <h4 className="font-semibold">Social Media</h4>
          <p className="text-sm text-blue-100 mt-2 leading-relaxed">Facebook | Instagram | YouTube</p>
        </div>
      </div>
      <p className="text-center py-3 text-xs text-blue-100 border-t border-blue-800">
        Copyright {new Date().getFullYear()} JMS Public School Chaudiha. All rights reserved.
      </p>
    </footer>
  );
}
