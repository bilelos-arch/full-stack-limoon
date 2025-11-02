'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

interface BookPreview3DProps {
  coverUrl: string;
  title?: string;
}

const BookPreview3D: React.FC<BookPreview3DProps> = ({ coverUrl, title }) => {
  return (
    <motion.div
      initial={{ rotateY: -10, rotateX: 2, scale: 1 }}
      whileHover={{ rotateY: 0, rotateX: 0, scale: 1.03 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="relative w-64 h-80 sm:w-72 sm:h-96 cursor-pointer group"
    >
      {/* Couverture du livre */}
      <div className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl bg-gray-100">
        <Image
          src={coverUrl}
          alt={title || 'Aperçu du livre'}
          fill
          className="object-cover rounded-lg group-hover:brightness-105 transition-all duration-500"
        />
      </div>

      {/* Tranche du livre */}
      <div className="absolute right-0 top-0 w-3 h-full bg-gradient-to-l from-gray-300 to-gray-100 rounded-r-lg shadow-inner" />

      {/* Reflet glossy animé */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: ['-100%', '120%'] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 5,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
      />

      {/* Ombre portée */}
      <div className="absolute -bottom-4 left-0 right-0 mx-auto w-5/6 h-6 bg-black/20 blur-md rounded-full group-hover:opacity-70 opacity-40 transition-all duration-500" />

      {/* Titre optionnel */}
      {title && (
        <div className="absolute -bottom-10 w-full text-center text-gray-700 font-semibold">
          {title}
        </div>
      )}
    </motion.div>
  );
};

export default BookPreview3D;
