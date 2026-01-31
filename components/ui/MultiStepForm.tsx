"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Beer, Sprout, Coins, Calendar, User, Package, X, Check } from "lucide-react";

interface FormData {
  nickname: string;
  cardLastDigits: string;
  type: "ALCO" | "PETRA";
  quantities: {
    stars1: number;
    stars2: number;
    stars3: number;
  };
}

interface MultiStepFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
}

export default function MultiStepForm({ onSubmit, onClose }: MultiStepFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nickname: "",
    cardLastDigits: "",
    type: "ALCO",
    quantities: { stars1: 0, stars2: 0, stars3: 0 }
  });

  const totalSteps = 7;

  const nextStep = () => {
    if (step === 1 && !formData.nickname.trim()) {
      setError("Введи свій нікнейм!");
      return;
    }
    if (step === 2 && formData.cardLastDigits.length !== 6) {
      setError("Введи 6 цифр карти!");
      return;
    }
    setError(null);
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const [error, setError] = useState<string | null>(null);

  const totalQuantity = formData.quantities.stars1 + formData.quantities.stars2 + formData.quantities.stars3;

  const handleSubmit = async () => {
    if (totalQuantity <= 0) {
      setError("Будь ласка, вкажіть кількість хоча б одного ресурсу!");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div key="step1" className="text-center">
            <div className="mb-8">
              <User className="w-20 h-20 mx-auto text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Крок 1 з {totalSteps}</h2>
            <p className="text-xl text-zinc-300 mb-8">Введи свій нікнейм</p>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => updateFormData({ nickname: e.target.value })}
              placeholder="Твій нікнейм в грі..."
              className="w-full px-6 py-4 text-lg bg-zinc-800/50 border-2 border-amber-500/30 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="mb-8">
              <Coins className="w-20 h-20 mx-auto text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Крок 2 з {totalSteps}</h2>
            <p className="text-xl text-zinc-300 mb-8">6 останніх цифр карти</p>
            <input
              type="text"
              maxLength={6}
              value={formData.cardLastDigits}
              onChange={(e) => updateFormData({ cardLastDigits: e.target.value.replace(/\D/g, '') })}
              placeholder="123456"
              className="w-full px-6 py-4 text-center text-2xl font-black bg-zinc-800/50 border-2 border-amber-500/30 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="mb-8"
            >
              <Package className="w-20 h-20 mx-auto text-amber-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Крок 3 з {totalSteps}</h2>
            <p className="text-xl text-zinc-300 mb-8">Що здас на склад?</p>
            <div className="grid grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateFormData({ type: "ALCO" })}
                className={`p-8 rounded-xl border-2 transition-all ${
                  formData.type === "ALCO"
                    ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-400/30"
                    : "bg-zinc-800/50 border-zinc-600 hover:border-amber-500/50"
                }`}
              >
                <Beer className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <span className="text-2xl font-bold text-white">🍺 Алко</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateFormData({ type: "PETRA" })}
                className={`p-8 rounded-xl border-2 transition-all ${
                  formData.type === "PETRA"
                    ? "bg-green-500/20 border-green-400 shadow-lg shadow-green-400/30"
                    : "bg-zinc-800/50 border-zinc-600 hover:border-green-500/50"
                }`}
              >
                <Sprout className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <span className="text-2xl font-bold text-white">🌿 Петра</span>
              </motion.button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <Calendar className="w-20 h-20 mx-auto text-amber-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Крок 4 з {totalSteps}</h2>
            <p className="text-xl text-zinc-300 mb-8">Дата здачі</p>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="date"
              value={new Date().toISOString().split('T')[0]}
              onChange={(e) => console.log('Date:', e.target.value)}
              className="w-full px-6 py-4 text-lg bg-zinc-800/50 border-2 border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <Coins className="w-20 h-20 mx-auto text-amber-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Крок 5 з {totalSteps}</h2>
            <p className="text-xl text-zinc-300 mb-8">Скільки зірочок здас на склад?</p>
            <div className="space-y-6">
              {[1, 2, 3].map((stars) => (
                <motion.div
                  key={stars}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: stars * 0.1 }}
                  className="flex items-center justify-between bg-zinc-800/30 p-4 rounded-lg"
                >
                  <span className="text-xl text-white flex items-center gap-2">
                    {Array.from({ length: stars }).map((_, i) => (
                      <span key={i} className="text-2xl">⭐</span>
                    ))}
                  </span>
                  <motion.input
                    whileFocus={{ scale: 1.05 }}
                    type="number"
                    min="0"
                    value={formData.quantities[`stars${stars}` as keyof typeof formData.quantities]}
                    onChange={(e) => updateFormData({
                      quantities: {
                        ...formData.quantities,
                        [`stars${stars}`]: parseInt(e.target.value) || 0
                      }
                    })}
                    placeholder="0"
                    className="w-24 px-4 py-2 text-center bg-zinc-700/50 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <Coins className="w-20 h-20 mx-auto text-green-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Крок 6 з {totalSteps}</h2>
            <p className="text-xl text-zinc-300 mb-8">Розрахунок винагороди</p>
            <div className="bg-zinc-800/30 p-6 rounded-xl space-y-4">
              <div className="text-lg text-zinc-300">
                <p>⭐ 1 зірка: {formData.quantities.stars1} шт × 50₴ = {formData.quantities.stars1 * 50}₴</p>
                <p>⭐⭐ 2 зірки: {formData.quantities.stars2} шт × 100₴ = {formData.quantities.stars2 * 100}₴</p>
                <p>⭐⭐⭐ 3 зірки: {formData.quantities.stars3} шт × 150₴ = {formData.quantities.stars3 * 150}₴</p>
              </div>
              <div className="border-t border-zinc-600 pt-4">
                <p className="text-2xl font-bold text-green-400">
                  Загалом: {(formData.quantities.stars1 * 50 + formData.quantities.stars2 * 100 + formData.quantities.stars3 * 150)}₴
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            key="step7"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <Check className="w-20 h-20 mx-auto text-green-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Крок 7 з {totalSteps}</h2>
            <p className="text-xl text-zinc-300 mb-8">Перевірка даних</p>
            <div className="bg-zinc-800/30 p-6 rounded-xl text-left space-y-3">
              <p className="text-lg"><span className="text-zinc-400">Нікнейм:</span> <span className="text-white font-semibold">{formData.nickname}</span></p>
              <p className="text-lg"><span className="text-zinc-400">Карта:</span> <span className="text-white font-semibold">*{formData.cardLastDigits}</span></p>
              <p className="text-lg"><span className="text-zinc-400">Тип:</span> <span className="text-white font-semibold">{formData.type === "ALCO" ? "🍺 Алко" : "🌿 Петра"}</span></p>
              <p className="text-lg"><span className="text-zinc-400">Кількість:</span> 
                <span className="text-white font-semibold">
                  {formData.quantities.stars1 > 0 && ` ⭐×${formData.quantities.stars1}`}
                  {formData.quantities.stars2 > 0 && ` ⭐⭐×${formData.quantities.stars2}`}
                  {formData.quantities.stars3 > 0 && ` ⭐⭐⭐×${formData.quantities.stars3}`}
                </span>
              </p>
              <p className="text-lg"><span className="text-zinc-400">Очікувана винагорода:</span> 
                <span className="text-green-400 font-bold text-xl">
                  {(formData.quantities.stars1 * 50 + formData.quantities.stars2 * 100 + formData.quantities.stars3 * 150)}₴
                </span>
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 rounded-2xl text-center max-w-md mx-4"
        >
          <Check className="w-20 h-20 mx-auto text-white mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Заявку подано!</h2>
          <p className="text-green-100">Твоя заявка успішно відправлена на модерацію</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700 shadow-2xl"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-400">Прогрес</span>
            <span className="text-sm text-zinc-400">{step} / {totalSteps}</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
            />
          </div>
        </div>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </motion.button>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, x: [0, -10, 10, -10, 10, 0] }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center text-xs font-bold text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <div className="min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              step === 1
                ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                : "bg-zinc-700 text-white hover:bg-zinc-600"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Назад
          </motion.button>

          {step === totalSteps ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.nickname.trim() || formData.cardLastDigits.length !== 6 || totalQuantity <= 0}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Відправка..." : "Подати заявку"}
              <Check className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              disabled={(step === 1 && !formData.nickname.trim()) || (step === 2 && formData.cardLastDigits.length !== 6)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Далі
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
